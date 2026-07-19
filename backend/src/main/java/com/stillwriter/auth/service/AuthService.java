package com.stillwriter.auth.service;

import com.stillwriter.auth.domain.NewLocalUser;
import com.stillwriter.auth.domain.IssuedToken;
import com.stillwriter.auth.domain.LoginResult;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.domain.NewUserSession;
import com.stillwriter.auth.dto.LoginRequest;
import com.stillwriter.auth.dto.LoginResponse;
import com.stillwriter.auth.domain.UserSignupResult;
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

import java.util.Locale;
import java.time.OffsetDateTime;

/**
 * 회원가입과 로그인 같은 인증 비즈니스 로직을 담당합니다.
 */
@Service
public class AuthService {

    private static final String SIGNUP_PURPOSE = "SIGNUP";

    private final AuthMapper authMapper;
    private final EmailVerificationMapper emailVerificationMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthTokenService authTokenService;
    private final long refreshTokenExpiresHours;

    public AuthService(AuthMapper authMapper,
                       EmailVerificationMapper emailVerificationMapper,
                       PasswordEncoder passwordEncoder,
                       AuthTokenService authTokenService,
                       @Value("${still-writer.auth.refresh-token-expires-hours}") long refreshTokenExpiresHours) {
        this.authMapper = authMapper;
        this.emailVerificationMapper = emailVerificationMapper;
        this.passwordEncoder = passwordEncoder;
        this.authTokenService = authTokenService;
        this.refreshTokenExpiresHours = refreshTokenExpiresHours;
    }

    /**
     * LOCAL 회원가입을 처리합니다.
     *
     * 처리 순서:
     * 1. 이메일을 소문자로 정규화합니다.
     * 2. 중복 이메일과 닉네임을 확인합니다.
     * 3. 비밀번호 원문을 BCrypt 해시로 변환합니다.
     * 4. users, auth_identities, user_settings를 하나의 트랜잭션으로 저장합니다.
     */
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
            // 동시 요청으로 사전 중복 검사를 통과한 뒤 UNIQUE 제약조건에서 막힌 경우를 안전하게 처리합니다.
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

    /**
     * LOCAL 이메일/비밀번호 로그인을 처리합니다.
     */
    @Transactional
    public LoginResult login(LoginRequest request, String ipAddress, String userAgent) {
        String normalizedEmail = normalizeEmail(request.email());

        LoginUser user = authMapper.findLoginUserByEmail(normalizedEmail)
                .orElseThrow(() -> new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다."));

        validateLoginAvailable(user, request.password());

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
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("로그인할 수 없는 계정입니다.");
        }

        if (user.getPasswordHash() == null || !passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new UnauthorizedException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
    }

    private String truncate(String value, int maxLength) {
        if (value == null || value.length() <= maxLength) {
            return value;
        }
        return value.substring(0, maxLength);
    }
}
