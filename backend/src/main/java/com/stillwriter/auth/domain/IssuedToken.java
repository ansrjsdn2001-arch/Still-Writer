package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * 발급된 토큰과 만료 시각을 함께 전달하는 값 객체입니다.
 */
public record IssuedToken(
        String token,
        OffsetDateTime expiresAt
) {
}
