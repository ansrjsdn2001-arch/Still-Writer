package com.stillwriter.auth.controller;

import com.stillwriter.auth.domain.LoginResult;
import com.stillwriter.auth.dto.SignupRequest;
import com.stillwriter.auth.dto.SignupResponse;
import com.stillwriter.auth.dto.LoginRequest;
import com.stillwriter.auth.dto.LoginResponse;
import com.stillwriter.auth.dto.EmailVerificationSendRequest;
import com.stillwriter.auth.dto.EmailVerificationSendResponse;
import com.stillwriter.auth.dto.EmailVerificationVerifyRequest;
import com.stillwriter.auth.dto.EmailVerificationVerifyResponse;
import com.stillwriter.auth.service.EmailVerificationService;
import com.stillwriter.auth.service.AuthService;
import com.stillwriter.auth.service.GoogleOAuthService;
import com.stillwriter.common.ApiResponse;
import jakarta.validation.Valid;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Objects;

/**
 * 인증 관련 HTTP API를 제공합니다.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
    private static final String GOOGLE_OAUTH_STATE_COOKIE_NAME = "googleOAuthState";

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final GoogleOAuthService googleOAuthService;
    private final boolean refreshTokenCookieSecure;
    private final String googleOAuthSuccessRedirectUri;

    public AuthController(AuthService authService,
                          EmailVerificationService emailVerificationService,
                          GoogleOAuthService googleOAuthService,
                          @Value("${still-writer.auth.refresh-token-cookie-secure}") boolean refreshTokenCookieSecure,
                          @Value("${still-writer.oauth.google.success-redirect-uri}") String googleOAuthSuccessRedirectUri) {
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
        this.googleOAuthService = googleOAuthService;
        this.refreshTokenCookieSecure = refreshTokenCookieSecure;
        this.googleOAuthSuccessRedirectUri = googleOAuthSuccessRedirectUri;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<SignupResponse>> signup(@Valid @RequestBody SignupRequest request) {
        SignupResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("회원가입이 완료되었습니다.", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request,
                                                            HttpServletRequest httpRequest,
                                                            HttpServletResponse httpResponse) {
        LoginResult result = authService.login(
                request,
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent")
        );

        addRefreshTokenCookie(httpResponse, result.refreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("로그인되었습니다.", result.response())
        );
    }

    @GetMapping("/oauth/google/authorize")
    public ResponseEntity<Void> authorizeGoogle(HttpServletResponse httpResponse) {
        String state = googleOAuthService.generateState();
        addGoogleOAuthStateCookie(httpResponse, state);

        URI authorizationUri = googleOAuthService.buildAuthorizationUri(state);

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, authorizationUri.toString())
                .build();
    }

    @GetMapping("/oauth/google/callback")
    public ResponseEntity<Void> callbackGoogle(@RequestParam("code") String code,
                                               @RequestParam("state") String state,
                                               HttpServletRequest httpRequest,
                                               HttpServletResponse httpResponse) {
        validateGoogleOAuthState(httpRequest, state);
        deleteGoogleOAuthStateCookie(httpResponse);

        LoginResult result = googleOAuthService.loginWithAuthorizationCode(
                code,
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent")
        );

        addRefreshTokenCookie(httpResponse, result.refreshToken());

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, buildGoogleOAuthSuccessRedirectUri(result.response()).toString())
                .build();
    }

    @PostMapping("/email-verification/send")
    public ResponseEntity<ApiResponse<EmailVerificationSendResponse>> sendEmailVerificationCode(
            @Valid @RequestBody EmailVerificationSendRequest request
    ) {
        System.out.println("[EmailVerification] 인증 메일 발송 API 호출 email=" + request.email());

        EmailVerificationSendResponse response = emailVerificationService.sendSignupCode(request);

        System.out.println("[EmailVerification] 인증 메일 발송 API 성공 email=" + response.email()
                + ", expiresAt=" + response.expiresAt());

        return ResponseEntity.ok(
                ApiResponse.success("인증 코드가 이메일로 발송되었습니다.", response)
        );
    }

    @PostMapping("/email-verification/verify")
    public ResponseEntity<ApiResponse<EmailVerificationVerifyResponse>> verifyEmailVerificationCode(
            @Valid @RequestBody EmailVerificationVerifyRequest request
    ) {
        EmailVerificationVerifyResponse response = emailVerificationService.verifySignupCode(request);

        return ResponseEntity.ok(
                ApiResponse.success("이메일 인증이 완료되었습니다.", response)
        );
    }

    private void addRefreshTokenCookie(HttpServletResponse response, String refreshToken) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, refreshToken);
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure); // 로컬 HTTP는 false, HTTPS 배포 환경은 true로 설정합니다.
        cookie.setPath("/api/auth");
        cookie.setAttribute("SameSite", "Lax");

        // Max-Age/Expires를 설정하지 않으면 브라우저 세션 쿠키가 되어 브라우저 종료 시 삭제됩니다.
        response.addCookie(cookie);
    }

    private void addGoogleOAuthStateCookie(HttpServletResponse response, String state) {
        Cookie cookie = new Cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, state);
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath("/api/auth/oauth/google");
        cookie.setMaxAge(300);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void deleteGoogleOAuthStateCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(GOOGLE_OAUTH_STATE_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath("/api/auth/oauth/google");
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void validateGoogleOAuthState(HttpServletRequest request, String receivedState) {
        String storedState = findCookieValue(request, GOOGLE_OAUTH_STATE_COOKIE_NAME);

        if (storedState == null || receivedState == null || !Objects.equals(storedState, receivedState)) {
            throw new IllegalArgumentException("Google 로그인 요청 상태값이 올바르지 않습니다. 처음부터 다시 시도해 주세요.");
        }
    }

    private String findCookieValue(HttpServletRequest request, String cookieName) {
        if (request.getCookies() == null) {
            return null;
        }

        return Arrays.stream(request.getCookies())
                .filter(cookie -> cookieName.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private URI buildGoogleOAuthSuccessRedirectUri(LoginResponse response) {
        String fragment = "userId=" + encode(String.valueOf(response.userId()))
                + "&email=" + encode(response.email())
                + "&nickname=" + encode(response.nickname())
                + "&accessToken=" + encode(response.accessToken())
                + "&tokenType=" + encode(response.tokenType())
                + "&accessTokenExpiresAt=" + encode(String.valueOf(response.accessTokenExpiresAt()));

        return URI.create(googleOAuthSuccessRedirectUri + "#" + fragment);
    }

    private String encode(String value) {
        return URLEncoder.encode(value == null ? "" : value, StandardCharsets.UTF_8)
                .replace("+", "%20");
    }

    private String getClientIp(HttpServletRequest request) {
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (forwardedFor != null && !forwardedFor.isBlank()) {
            return forwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
