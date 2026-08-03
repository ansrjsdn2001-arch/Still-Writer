package com.stillwriter.auth.security;

import com.stillwriter.auth.domain.AccessTokenPayload;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.mapper.AuthMapper;
import com.stillwriter.auth.service.AuthTokenService;
import com.stillwriter.common.ErrorResponse;
import com.stillwriter.common.UnauthorizedException;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Set;

/**
 * /api 요청에 포함된 Access Token을 검증하고 현재 사용자 정보를 request에 저장합니다.
 */
@Component
public class AccessTokenAuthenticationFilter implements Filter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";
    private static final Set<String> PUBLIC_AUTH_PATHS = Set.of(
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/refresh",
            "/api/auth/logout",
            "/api/auth/email-verification/send",
            "/api/auth/email-verification/verify",
            "/api/auth/oauth/google/authorize",
            "/api/auth/oauth/google/callback",
            "/api/auth/oauth/kakao/authorize",
            "/api/auth/oauth/kakao/callback",
            "/api/auth/oauth/exchange"
    );

    private final AuthTokenService authTokenService;
    private final AuthMapper authMapper;
    private final ObjectMapper objectMapper;

    public AccessTokenAuthenticationFilter(AuthTokenService authTokenService,
                                           AuthMapper authMapper,
                                           ObjectMapper objectMapper) {
        this.authTokenService = authTokenService;
        this.authMapper = authMapper;
        this.objectMapper = objectMapper;
    }

    @Override
    public void doFilter(ServletRequest servletRequest,
                         ServletResponse servletResponse,
                         FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) servletRequest;
        HttpServletResponse response = (HttpServletResponse) servletResponse;

        if (shouldSkip(request)) {
            chain.doFilter(request, response);
            return;
        }

        try {
            String token = extractBearerToken(request);
            AccessTokenPayload payload = authTokenService.parseAccessToken(token);
            LoginUser user = authMapper.findLoginUserById(payload.userId())
                    .orElseThrow(() -> new UnauthorizedException("로그인이 필요합니다."));

            if (!"ACTIVE".equals(user.getStatus())) {
                throw new UnauthorizedException("로그인할 수 없는 계정입니다.");
            }

            request.setAttribute(
                    CurrentUserArgumentResolver.REQUEST_ATTRIBUTE_NAME,
                    new AuthenticatedUser(user.getId(), user.getEmail(), user.getNickname())
            );

            chain.doFilter(request, response);
        } catch (UnauthorizedException exception) {
            writeUnauthorizedResponse(response, exception.getMessage());
        }
    }

    private boolean shouldSkip(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String path = request.getRequestURI();
        if (!path.startsWith("/api/")) {
            return true;
        }

        return PUBLIC_AUTH_PATHS.contains(path);
    }

    private String extractBearerToken(HttpServletRequest request) {
        String authorization = request.getHeader(AUTHORIZATION_HEADER);
        if (authorization == null || !authorization.startsWith(BEARER_PREFIX)) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return authorization.substring(BEARER_PREFIX.length()).trim();
    }

    private void writeUnauthorizedResponse(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(ErrorResponse.of(message)));
    }
}
