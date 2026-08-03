package com.stillwriter.auth.service;

import com.stillwriter.auth.domain.AccessTokenPayload;
import com.stillwriter.auth.domain.IssuedToken;
import com.stillwriter.common.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Access Token과 Refresh Token을 발급하고 해시를 계산합니다.
 *
 * <p>현재는 외부 JWT 라이브러리 없이 HMAC-SHA256 기반 JWT를 생성합니다.
 * 추후 Spring Security 인증 필터를 붙일 때도 이 토큰 검증 로직을 재사용할 수 있습니다.
 */
@Service
public class AuthTokenService {

    private final SecureRandom secureRandom = new SecureRandom();
    private final ObjectMapper objectMapper;
    private final String jwtSecret;
    private final long accessTokenExpiresMinutes;

    public AuthTokenService(
            ObjectMapper objectMapper,
            @Value("${still-writer.auth.jwt-secret}") String jwtSecret,
            @Value("${still-writer.auth.access-token-expires-minutes}") long accessTokenExpiresMinutes
    ) {
        this.objectMapper = objectMapper;
        this.jwtSecret = jwtSecret;
        this.accessTokenExpiresMinutes = accessTokenExpiresMinutes;
    }

    public IssuedToken issueAccessToken(Long userId, String email) {
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusMinutes(accessTokenExpiresMinutes);

        String headerJson = """
                {"alg":"HS256","typ":"JWT"}
                """.trim();
        String payloadJson = """
                {"sub":"%d","email":"%s","exp":%d}
                """.formatted(userId, escapeJson(email), expiresAt.toEpochSecond());

        String header = base64Url(headerJson.getBytes(StandardCharsets.UTF_8));
        String payload = base64Url(payloadJson.getBytes(StandardCharsets.UTF_8));
        String unsignedToken = header + "." + payload;
        String signature = base64Url(hmacSha256(unsignedToken));

        return new IssuedToken(unsignedToken + "." + signature, expiresAt);
    }

    public AccessTokenPayload parseAccessToken(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        String[] parts = token.split("\\.");
        if (parts.length != 3) {
            throw new UnauthorizedException("Access Token 형식이 올바르지 않습니다.");
        }

        String unsignedToken = parts[0] + "." + parts[1];
        String expectedSignature = base64Url(hmacSha256(unsignedToken));

        if (!MessageDigest.isEqual(
                expectedSignature.getBytes(StandardCharsets.UTF_8),
                parts[2].getBytes(StandardCharsets.UTF_8)
        )) {
            throw new UnauthorizedException("Access Token 서명이 올바르지 않습니다.");
        }

        try {
            String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            JsonNode payload = objectMapper.readTree(payloadJson);

            String subject = payload.path("sub").asText(null);
            String email = payload.path("email").asText(null);
            long expiresEpochSeconds = payload.path("exp").asLong(0);

            if (subject == null || subject.isBlank() || email == null || email.isBlank() || expiresEpochSeconds <= 0) {
                throw new UnauthorizedException("Access Token 정보가 올바르지 않습니다.");
            }

            OffsetDateTime expiresAt = OffsetDateTime.ofInstant(
                    java.time.Instant.ofEpochSecond(expiresEpochSeconds),
                    ZoneOffset.UTC
            );

            if (!expiresAt.isAfter(OffsetDateTime.now(ZoneOffset.UTC))) {
                throw new UnauthorizedException("로그인이 만료되었습니다. 다시 로그인해 주세요.");
            }

            return new AccessTokenPayload(Long.parseLong(subject), email, expiresAt);
        } catch (UnauthorizedException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new UnauthorizedException("Access Token을 확인할 수 없습니다.");
        }
    }

    public String issueRefreshToken() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return base64Url(randomBytes);
    }

    public String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 해시 알고리즘을 사용할 수 없습니다.", exception);
        }
    }

    private byte[] hmacSha256(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            return mac.doFinal(value.getBytes(StandardCharsets.UTF_8));
        } catch (Exception exception) {
            throw new IllegalStateException("Access Token 서명에 실패했습니다.", exception);
        }
    }

    private String base64Url(byte[] value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String escapeJson(String value) {
        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
