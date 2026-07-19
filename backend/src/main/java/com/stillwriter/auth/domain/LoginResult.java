package com.stillwriter.auth.domain;

import com.stillwriter.auth.dto.LoginResponse;

/**
 * 로그인 처리 결과입니다.
 * Access Token은 응답 본문으로, Refresh Token은 HttpOnly 쿠키로 전달합니다.
 */
public record LoginResult(
        LoginResponse response,
        String refreshToken
) {
}
