package com.stillwriter.auth.service;

import com.stillwriter.auth.domain.IssuedToken;
import com.stillwriter.auth.domain.KakaoUserInfo;
import com.stillwriter.auth.domain.LoginResult;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.domain.NewSocialUser;
import com.stillwriter.auth.domain.NewUserSession;
import com.stillwriter.auth.domain.OAuthTokenResponse;
import com.stillwriter.auth.dto.LoginResponse;
import com.stillwriter.auth.mapper.AuthMapper;
import com.stillwriter.common.ExternalOAuthException;
import com.stillwriter.common.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.Base64;
import java.util.Locale;

/**
 * Kakao OAuth Authorization Code Flow를 처리합니다.
 * 비용이 발생할 수 있는 카카오톡 메시지, 알림톡, 친구톡 API는 사용하지 않습니다.
 */
@Service
public class KakaoOAuthService {

    private static final String PROVIDER = "KAKAO";
    private static final int MAX_NICKNAME_LENGTH = 50;

    private final AuthMapper authMapper;
    private final AuthTokenService authTokenService;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final SecureRandom secureRandom;
    private final String clientId;
    private final String clientSecret;
    private final String redirectUri;
    private final String authorizationUri;
    private final String tokenUri;
    private final String userInfoUri;
    private final String scope;
    private final long refreshTokenExpiresHours;

    public KakaoOAuthService(AuthMapper authMapper,
                             AuthTokenService authTokenService,
                             ObjectMapper objectMapper,
                             @Value("${still-writer.oauth.kakao.client-id}") String clientId,
                             @Value("${still-writer.oauth.kakao.client-secret}") String clientSecret,
                             @Value("${still-writer.oauth.kakao.redirect-uri}") String redirectUri,
                             @Value("${still-writer.oauth.kakao.authorization-uri}") String authorizationUri,
                             @Value("${still-writer.oauth.kakao.token-uri}") String tokenUri,
                             @Value("${still-writer.oauth.kakao.user-info-uri}") String userInfoUri,
                             @Value("${still-writer.oauth.kakao.scope}") String scope,
                             @Value("${still-writer.auth.refresh-token-expires-hours}") long refreshTokenExpiresHours) {
        this.authMapper = authMapper;
        this.authTokenService = authTokenService;
        this.objectMapper = objectMapper;
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.redirectUri = redirectUri;
        this.authorizationUri = authorizationUri;
        this.tokenUri = tokenUri;
        this.userInfoUri = userInfoUri;
        this.scope = scope;
        this.refreshTokenExpiresHours = refreshTokenExpiresHours;
        this.secureRandom = new SecureRandom();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    public String generateState() {
        byte[] randomBytes = new byte[32];
        secureRandom.nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public URI buildAuthorizationUri(String state) {
        validateConfigured();

        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(authorizationUri)
                .queryParam("client_id", clientId)
                .queryParam("redirect_uri", redirectUri)
                .queryParam("response_type", "code")
                .queryParam("state", state);

        if (scope != null && !scope.isBlank()) {
            builder.queryParam("scope", scope);
        }

        return builder
                .build()
                .encode()
                .toUri();
    }

    @Transactional
    public LoginResult loginWithAuthorizationCode(String code, String ipAddress, String userAgent) {
        LoginUser user = authenticateAuthorizationCode(code);

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("로그인할 수 없는 계정입니다.");
        }

        return issueLoginResult(user, ipAddress, userAgent);
    }

    @Transactional
    public LoginUser authenticateAuthorizationCode(String code) {
        OAuthTokenResponse tokenResponse = exchangeAuthorizationCode(code);
        KakaoUserInfo userInfo = fetchUserInfo(tokenResponse.accessToken());
        return findOrCreateUser(userInfo);
    }

    private OAuthTokenResponse exchangeAuthorizationCode(String code) {
        String body = buildTokenRequestBody(code);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(tokenUri))
                .timeout(Duration.ofSeconds(10))
                .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ExternalOAuthException("Kakao 토큰 발급에 실패했습니다.");
            }
            return objectMapper.readValue(response.body(), OAuthTokenResponse.class);
        } catch (IOException exception) {
            throw new ExternalOAuthException("Kakao 토큰 응답을 해석할 수 없습니다.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ExternalOAuthException("Kakao 토큰 요청이 중단되었습니다.", exception);
        }
    }

    private String buildTokenRequestBody(String code) {
        String body = formBody(
                "grant_type", "authorization_code",
                "client_id", clientId,
                "redirect_uri", redirectUri,
                "code", code
        );

        if (clientSecret != null && !clientSecret.isBlank()) {
            body += "&client_secret=" + urlEncode(clientSecret);
        }

        return body;
    }

    private KakaoUserInfo fetchUserInfo(String accessToken) {
        if (accessToken == null || accessToken.isBlank()) {
            throw new ExternalOAuthException("Kakao Access Token이 비어 있습니다.");
        }

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(userInfoUri))
                .timeout(Duration.ofSeconds(10))
                .header("Authorization", "Bearer " + accessToken)
                .header("Content-Type", "application/x-www-form-urlencoded;charset=utf-8")
                .GET()
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ExternalOAuthException("Kakao 사용자 정보 조회에 실패했습니다.");
            }

            JsonNode root = objectMapper.readTree(response.body());
            String id = root.path("id").asText(null);
            JsonNode kakaoAccount = root.path("kakao_account");
            JsonNode profile = kakaoAccount.path("profile");
            String realEmail = normalizeEmail(text(kakaoAccount, "email"));
            String nickname = text(profile, "nickname");

            KakaoUserInfo userInfo = new KakaoUserInfo(
                    id,
                    realEmail == null || realEmail.isBlank() ? buildInternalEmail(id) : realEmail,
                    nickname
            );
            validateUserInfo(userInfo);
            return userInfo;
        } catch (IOException exception) {
            throw new ExternalOAuthException("Kakao 사용자 정보 응답을 해석할 수 없습니다.", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ExternalOAuthException("Kakao 사용자 정보 요청이 중단되었습니다.", exception);
        }
    }

    private LoginUser findOrCreateUser(KakaoUserInfo userInfo) {
        return authMapper.findLoginUserByProvider(PROVIDER, userInfo.id())
                .orElseGet(() -> linkOrCreateUser(userInfo));
    }

    private LoginUser linkOrCreateUser(KakaoUserInfo userInfo) {
        LoginUser existingUser = authMapper.findLoginUserByEmail(userInfo.email()).orElse(null);

        if (existingUser != null) {
            try {
                authMapper.insertOAuthIdentity(existingUser.getId(), PROVIDER, userInfo.id(), userInfo.email());
            } catch (DuplicateKeyException exception) {
                return authMapper.findLoginUserByProvider(PROVIDER, userInfo.id())
                        .orElseThrow(() -> new ExternalOAuthException("Kakao 계정 연결 상태를 확인할 수 없습니다.", exception));
            }
            return existingUser;
        }

        NewSocialUser newUser = new NewSocialUser(userInfo.email(), generateUniqueNickname(userInfo));

        try {
            authMapper.insertSocialUser(newUser);
            authMapper.insertOAuthIdentity(newUser.getId(), PROVIDER, userInfo.id(), userInfo.email());
            authMapper.insertDefaultUserSettings(newUser.getId());
        } catch (DuplicateKeyException exception) {
            return authMapper.findLoginUserByProvider(PROVIDER, userInfo.id())
                    .or(() -> authMapper.findLoginUserByEmail(userInfo.email()))
                    .orElseThrow(() -> new ExternalOAuthException("Kakao 회원 생성 중 중복 데이터가 발생했습니다.", exception));
        }

        return authMapper.findLoginUserByProvider(PROVIDER, userInfo.id())
                .orElseThrow(() -> new ExternalOAuthException("Kakao 회원 생성 결과를 조회할 수 없습니다."));
    }

    private LoginResult issueLoginResult(LoginUser user, String ipAddress, String userAgent) {
        IssuedToken accessToken = authTokenService.issueAccessToken(user.getId(), user.getEmail());
        String refreshToken = authTokenService.issueRefreshToken();
        OffsetDateTime refreshTokenExpiresAt = OffsetDateTime.now().plusHours(refreshTokenExpiresHours);

        NewUserSession session = new NewUserSession(
                user.getId(),
                authTokenService.sha256(refreshToken),
                null,
                ipAddress,
                truncate(userAgent, 500),
                refreshTokenExpiresAt
        );

        authMapper.insertUserSession(session);
        authMapper.updateLastLoginAt(user.getId());

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                accessToken.token(),
                "Bearer",
                accessToken.expiresAt()
        );

        return new LoginResult(response, refreshToken);
    }

    private String generateUniqueNickname(KakaoUserInfo userInfo) {
        String base = sanitizeNickname(userInfo.nickname());
        if (base.length() < 2) {
            base = "KakaoUser";
        }

        base = trimToLength(base, 40);

        if (!authMapper.existsUserByNickname(base)) {
            return base;
        }

        for (int i = 1; i <= 20; i++) {
            String suffix = "-" + i;
            String candidate = trimToLength(base, MAX_NICKNAME_LENGTH - suffix.length()) + suffix;
            if (!authMapper.existsUserByNickname(candidate)) {
                return candidate;
            }
        }

        String suffix = "-" + System.currentTimeMillis();
        return trimToLength(base, MAX_NICKNAME_LENGTH - suffix.length()) + suffix;
    }

    private void validateConfigured() {
        if (clientId == null || clientId.isBlank()) {
            throw new ExternalOAuthException("Kakao OAuth REST API 키가 설정되지 않았습니다.");
        }
    }

    private void validateUserInfo(KakaoUserInfo userInfo) {
        if (userInfo.id() == null || userInfo.id().isBlank()) {
            throw new ExternalOAuthException("Kakao 사용자 식별자를 확인할 수 없습니다.");
        }
        if (userInfo.email() == null || userInfo.email().isBlank()) {
            throw new ExternalOAuthException("Kakao 사용자 저장용 이메일 식별자를 생성할 수 없습니다.");
        }
    }

    private String buildInternalEmail(String kakaoId) {
        if (kakaoId == null || kakaoId.isBlank()) {
            return null;
        }
        return "kakao_" + kakaoId + "@kakao.local";
    }

    private String formBody(String... values) {
        StringBuilder builder = new StringBuilder();
        for (int i = 0; i < values.length; i += 2) {
            if (i > 0) {
                builder.append("&");
            }
            builder.append(urlEncode(values[i]))
                    .append("=")
                    .append(urlEncode(values[i + 1]));
        }
        return builder.toString();
    }

    private String urlEncode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8);
    }

    private String text(JsonNode root, String fieldName) {
        JsonNode node = root.get(fieldName);
        if (node == null || node.isNull()) {
            return null;
        }
        return node.asText();
    }

    private String normalizeEmail(String email) {
        if (email == null) {
            return null;
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String sanitizeNickname(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("[^\\p{L}\\p{N}_\\- ]", "")
                .trim()
                .replaceAll("\\s+", " ");
    }

    private String trimToLength(String value, int maxLength) {
        if (value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength).trim();
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
