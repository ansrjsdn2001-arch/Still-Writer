package com.stillwriter.auth.service;

import com.stillwriter.auth.domain.IssuedToken;
import com.stillwriter.auth.domain.LoginResult;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.domain.NewLocalUser;
import com.stillwriter.auth.domain.NewOAuthExchangeCode;
import com.stillwriter.auth.domain.NewUserSession;
import com.stillwriter.auth.domain.OAuthExchangeCode;
import com.stillwriter.auth.domain.UserSession;
import com.stillwriter.auth.domain.UserSignupResult;
import com.stillwriter.auth.dto.LoginRequest;
import com.stillwriter.auth.dto.LoginResponse;
import com.stillwriter.auth.dto.OAuthExchangeRequest;
import com.stillwriter.auth.dto.SignupRequest;
import com.stillwriter.auth.dto.SignupResponse;
import com.stillwriter.auth.mapper.AuthMapper;
import com.stillwriter.auth.mapper.EmailVerificationMapper;
import com.stillwriter.common.DuplicateResourceException;
import com.stillwriter.common.UnauthorizedException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Locale;

/**
 * 회원가입, 로그인, Refresh Token, OAuth 교환 코드 같은 인증 비즈니스 로직을 처리합니다.
 */
@Service
public class AuthService {

    private static final String SIGNUP_PURPOSE = "SIGNUP";

    private final AuthMapper authMapper;
    private final EmailVerificationMapper emailVerificationMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final long refreshTokenExpiresHours;
    private final long oauthExchangeCodeExpiresSeconds;

    public AuthService(AuthMapper authMapper,
                       EmailVerificationMapper emailVerificationMapper,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService authTokenService,
                       @Value("${still-writer.auth.refresh-token-expires-hours}") long refreshTokenExpiresHours,
                       @Value("${still-writer.oauth.exchange-code-expires-seconds}") long oauthExchangeCodeExpiresSeconds) {
        this.authMapper = authMapper;
        this.emailVerificationMapper = emailVerificationMapper;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.refreshTokenExpiresHours = refreshTokenExpiresHours;
        this.oauthExchangeCodeExpiresSeconds = oauthExchangeCodeExpiresSeconds;
    }

    @Transactional
    public SignupResponse signup(SignupRequest request) {
        String normalizedEmail = normalizeEmail(request.email());
        String nickname = request.nickname().trim();

        validateDuplicatedEmail(normalizedEmail);
        validateDuplicatedNickname(nickname);
        Long verifiedCodeId = emailVerificationMapper.findVerifiedSignupCodeId(normalizedEmail, SIGNUP_PURPOSE)
                .orElseThrow(() -> new IllegalArgumentException("이메일 인증을 먼저 완료해 주세요."));

        String passwordHash = passwordEncoder.encode(request.password());
        NewLocalUser newUser = new NewLocalUser(normalizedEmail, passwordHash, nickname);

        try {
            authMapper.insertLocalUser(newUser);
            authMapper.insertLocalIdentity(newUser.getId(), normalizedEmail, normalizedEmail);
            authMapper.insertDefaultUserSettings(newUser.getId());
            emailVerificationMapper.consumeVerifiedCode(verifiedCodeId, OffsetDateTime.now());
        } catch (DuplicateKeyException exception) {
            throw new DuplicateResourceException("이미 사용 중인 이메일 또는 닉네임입니다.");
        }

        UserSignupResult result = authMapper.findSignupResultById(newUser.getId())
                .orElseThrow(() -> new IllegalStateException("회원가입 결과를 조회할 수 없습니다."));

        return new SignupResponse(
                result.getId(),
                result.getEmail(),
                result.getNickname(),
                result.getStatus(),
                result.getCreatedAt()
        );
    }

    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress, String userAgent) {
        String normalizedEmail = normalizeEmail(request.email());

        LoginUser user = authMapper.findLoginUserByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다."));

        validateLoginAvailable(user, request.password());

        return issueLoginResult(user, ipAddress, userAgent);
    }

    @Transactional
    public LoginResult refresh(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UnauthorizedException("인증 정보가 유효하지 않습니다.");
        }

        String oldRefreshTokenHash = authTokenService.sha256(refreshToken);
        UserSession session = authMapper.findUserSessionByRefreshTokenHash(oldRefreshTokenHash)
                .orElseThrow(() -> new UnauthorizedException("인증 정보가 유효하지 않습니다."));

        if (session.getRevokedAt() != null || !session.getExpiresAt().isAfter(OffsetDateTime.now())) {
            throw new UnauthorizedException("인증 정보가 유효하지 않습니다.");
        }

        LoginUser user = authMapper.findLoginUserById(session.getUserId())
                .orElseThrow(() -> new UnauthorizedException("인증 정보가 유효하지 않습니다."));
        validateUserActive(user);

        IssuedToken accessToken = authTokenService.issueAccessToken(user.getId(), user.getEmail());
        String newRefreshToken = authTokenService.issueRefreshToken();
        String newRefreshTokenHash = authTokenService.sha256(newRefreshToken);
        OffsetDateTime refreshTokenExpiresAt = OffsetDateTime.now().plusHours(refreshTokenExpiresHours);

        int updatedRows = authMapper.rotateRefreshToken(
                session.getId(),
                oldRefreshTokenHash,
                newRefreshTokenHash,
                refreshTokenExpiresAt
        );

        if (updatedRows != 1) {
            throw new UnauthorizedException("인증 정보가 유효하지 않습니다.");
        }

        LoginResponse response = new LoginResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                accessToken.token(),
                "Bearer",
                accessToken.expiresAt()
        );

        return new LoginResult(response, newRefreshToken);
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }

        authMapper.revokeUserSessionByRefreshTokenHash(
                authTokenService.sha256(refreshToken),
                OffsetDateTime.now()
        );
    }

    @Transactional
    public void logoutAll(Long userId) {
        authMapper.revokeAllUserSessions(userId, OffsetDateTime.now());
    }

    @Transactional
    public String issueOAuthExchangeCode(LoginUser user, String provider) {
        validateUserActive(user);

        String rawCode = authTokenService.issueRefreshToken();
        OffsetDateTime expiresAt = OffsetDateTime.now().plusSeconds(oauthExchangeCodeExpiresSeconds);

        authMapper.insertOAuthExchangeCode(new NewOAuthExchangeCode(
                authTokenService.sha256(rawCode),
                user.getId(),
                provider,
                expiresAt
        ));

        return rawCode;
    }

    @Transactional
    public LoginResult exchangeOAuthCode(OAuthExchangeRequest request, String ipAddress, String userAgent) {
        String codeHash = authTokenService.sha256(request.code());
        OAuthExchangeCode exchangeCode = authMapper.findOAuthExchangeCodeByHash(codeHash)
                .orElseThrow(() -> new UnauthorizedException("OAuth 로그인 정보가 유효하지 않습니다."));

        if (exchangeCode.getConsumedAt() != null || !exchangeCode.getExpiresAt().isAfter(OffsetDateTime.now())) {
            throw new UnauthorizedException("OAuth 로그인 정보가 유효하지 않습니다.");
        }

        int consumedRows = authMapper.consumeOAuthExchangeCode(exchangeCode.getId(), OffsetDateTime.now());
        if (consumedRows != 1) {
            throw new UnauthorizedException("OAuth 로그인 정보가 유효하지 않습니다.");
        }

        LoginUser user = authMapper.findLoginUserById(exchangeCode.getUserId())
                .orElseThrow(() -> new UnauthorizedException("OAuth 로그인 정보가 유효하지 않습니다."));
        validateUserActive(user);

        return issueLoginResult(user, ipAddress, userAgent);
    }

    private void validateDuplicatedEmail(String email) {
        if (authMapper.existsUserByEmail(email)) {
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다.");
        }
    }

    private void validateDuplicatedNickname(String nickname) {
        if (authMapper.existsUserByNickname(nickname)) {
            throw new DuplicateResourceException("이미 사용 중인 닉네임입니다.");
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validateLoginAvailable(LoginUser user, String rawPassword) {
        validateUserActive(user);

        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    private void validateUserActive(LoginUser user) {
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("로그인할 수 없는 계정입니다.");
        }
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

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
