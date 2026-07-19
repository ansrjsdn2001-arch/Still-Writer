package com.stillwriter.auth.dto;

import java.time.OffsetDateTime;

/**
 * 로그인 성공 응답 DTO입니다.
 * Refresh Token은 HttpOnly 쿠키로 전달하므로 응답 본문에는 포함하지 않습니다.
 */
public record LoginResponse(
        Long userId,
        String email,
        String nickname,
        String accessToken,
        String tokenType,
        OffsetDateTime accessTokenExpiresAt
) {
}
