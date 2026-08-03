package com.stillwriter.auth.controller;

import com.stillwriter.auth.domain.LoginResult;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.dto.EmailVerificationSendRequest;
import com.stillwriter.auth.dto.EmailVerificationSendResponse;
import com.stillwriter.auth.dto.EmailVerificationVerifyRequest;
import com.stillwriter.auth.dto.EmailVerificationVerifyResponse;
import com.stillwriter.auth.dto.LoginRequest;
import com.stillwriter.auth.dto.LoginResponse;
import com.stillwriter.auth.dto.OAuthExchangeRequest;
import com.stillwriter.auth.dto.SignupRequest;
import com.stillwriter.auth.dto.SignupResponse;
import com.stillwriter.auth.service.AuthService;
import com.stillwriter.auth.service.EmailVerificationService;
import com.stillwriter.auth.service.GoogleOAuthService;
import com.stillwriter.auth.service.KakaoOAuthService;
import com.stillwriter.common.ApiResponse;
import com.stillwriter.common.UnauthorizedException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
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
    private static final String KAKAO_OAUTH_STATE_COOKIE_NAME = "kakaoOAuthState";
    private static final String REFRESH_TOKEN_COOKIE_PATH = "/api/auth";

    private final AuthService authService;
    private final EmailVerificationService emailVerificationService;
    private final GoogleOAuthService googleOAuthService;
    private final KakaoOAuthService kakaoOAuthService;
    private final boolean refreshTokenCookieSecure;
    private final String googleOAuthSuccessRedirectUri;
    private final String kakaoOAuthSuccessRedirectUri;

    public AuthController(AuthService authService,
                          EmailVerificationService emailVerificationService,
                          GoogleOAuthService googleOAuthService,
                          KakaoOAuthService kakaoOAuthService,
                          @Value("${still-writer.auth.refresh-token-cookie-secure}") boolean refreshTokenCookieSecure,
                          @Value("${still-writer.oauth.google.success-redirect-uri}") String googleOAuthSuccessRedirectUri,
                          @Value("${still-writer.oauth.kakao.success-redirect-uri}") String kakaoOAuthSuccessRedirectUri) {
        this.authService = authService;
        this.emailVerificationService = emailVerificationService;
        this.googleOAuthService = googleOAuthService;
        this.kakaoOAuthService = kakaoOAuthService;
        this.refreshTokenCookieSecure = refreshTokenCookieSecure;
        this.googleOAuthSuccessRedirectUri = googleOAuthSuccessRedirectUri;
        this.kakaoOAuthSuccessRedirectUri = kakaoOAuthSuccessRedirectUri;
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

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponse>> refresh(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse httpResponse
    ) {
        try {
            LoginResult result = authService.refresh(refreshToken);
            addRefreshTokenCookie(httpResponse, result.refreshToken());

            return ResponseEntity.ok(
                    ApiResponse.success("Access Token이 재발급되었습니다.", result.response())
            );
        } catch (UnauthorizedException exception) {
            deleteRefreshTokenCookie(httpResponse);
            throw exception;
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @CookieValue(name = REFRESH_TOKEN_COOKIE_NAME, required = false) String refreshToken,
            HttpServletResponse httpResponse
    ) {
        authService.logout(refreshToken);
        deleteRefreshTokenCookie(httpResponse);

        return ResponseEntity.ok(
                ApiResponse.success("로그아웃되었습니다.", null)
        );
    }

    @GetMapping("/oauth/google/authorize")
    public ResponseEntity<Void> authorizeGoogle(HttpServletResponse httpResponse) {
        String state = googleOAuthService.generateState();
        addOAuthStateCookie(httpResponse, GOOGLE_OAUTH_STATE_COOKIE_NAME, state, "/api/auth/oauth/google");

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
        validateOAuthState(httpRequest, GOOGLE_OAUTH_STATE_COOKIE_NAME, state, "Google");
        deleteOAuthStateCookie(httpResponse, GOOGLE_OAUTH_STATE_COOKIE_NAME, "/api/auth/oauth/google");

        LoginUser user = googleOAuthService.authenticateAuthorizationCode(code);
        String exchangeCode = authService.issueOAuthExchangeCode(user, "GOOGLE");

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, buildOAuthExchangeRedirectUri(googleOAuthSuccessRedirectUri, exchangeCode).toString())
                .build();
    }

    @GetMapping("/oauth/kakao/authorize")
    public ResponseEntity<Void> authorizeKakao(HttpServletResponse httpResponse) {
        String state = kakaoOAuthService.generateState();
        addOAuthStateCookie(httpResponse, KAKAO_OAUTH_STATE_COOKIE_NAME, state, "/api/auth/oauth/kakao");

        URI authorizationUri = kakaoOAuthService.buildAuthorizationUri(state);

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, authorizationUri.toString())
                .build();
    }

    @GetMapping("/oauth/kakao/callback")
    public ResponseEntity<Void> callbackKakao(@RequestParam("code") String code,
                                              @RequestParam("state") String state,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        validateOAuthState(httpRequest, KAKAO_OAUTH_STATE_COOKIE_NAME, state, "Kakao");
        deleteOAuthStateCookie(httpResponse, KAKAO_OAUTH_STATE_COOKIE_NAME, "/api/auth/oauth/kakao");

        LoginUser user = kakaoOAuthService.authenticateAuthorizationCode(code);
        String exchangeCode = authService.issueOAuthExchangeCode(user, "KAKAO");

        return ResponseEntity
                .status(HttpStatus.FOUND)
                .header(HttpHeaders.LOCATION, buildOAuthExchangeRedirectUri(kakaoOAuthSuccessRedirectUri, exchangeCode).toString())
                .build();
    }

    @PostMapping("/oauth/exchange")
    public ResponseEntity<ApiResponse<LoginResponse>> exchangeOAuthCode(@Valid @RequestBody OAuthExchangeRequest request,
                                                                        HttpServletRequest httpRequest,
                                                                        HttpServletResponse httpResponse) {
        LoginResult result = authService.exchangeOAuthCode(
                request,
                getClientIp(httpRequest),
                httpRequest.getHeader("User-Agent")
        );

        addRefreshTokenCookie(httpResponse, result.refreshToken());

        return ResponseEntity.ok(
                ApiResponse.success("OAuth 로그인이 완료되었습니다.", result.response())
        );
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
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath(REFRESH_TOKEN_COOKIE_PATH);
        cookie.setAttribute("SameSite", "Lax");

        // 브라우저가 완전히 종료되면 삭제되는 세션 쿠키로 사용합니다.
        response.addCookie(cookie);
    }

    private void deleteRefreshTokenCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie(REFRESH_TOKEN_COOKIE_NAME, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath(REFRESH_TOKEN_COOKIE_PATH);
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void addOAuthStateCookie(HttpServletResponse response, String cookieName, String state, String path) {
        Cookie cookie = new Cookie(cookieName, state);
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath(path);
        cookie.setMaxAge(300);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void deleteOAuthStateCookie(HttpServletResponse response, String cookieName, String path) {
        Cookie cookie = new Cookie(cookieName, "");
        cookie.setHttpOnly(true);
        cookie.setSecure(refreshTokenCookieSecure);
        cookie.setPath(path);
        cookie.setMaxAge(0);
        cookie.setAttribute("SameSite", "Lax");
        response.addCookie(cookie);
    }

    private void validateOAuthState(HttpServletRequest request, String cookieName, String receivedState, String providerName) {
        String storedState = findCookieValue(request, cookieName);

        if (storedState == null || receivedState == null || !Objects.equals(storedState, receivedState)) {
            throw new IllegalArgumentException(providerName + " 로그인 요청 상태값이 올바르지 않습니다. 처음부터 다시 시도해 주세요.");
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

    private URI buildOAuthExchangeRedirectUri(String successRedirectUri, String exchangeCode) {
        String separator = successRedirectUri.contains("?") ? "&" : "?";
        return URI.create(successRedirectUri + separator + "code=" + encode(exchangeCode));
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
