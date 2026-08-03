package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * Access Token 검증 후 사용할 최소 인증 정보입니다.
 */
public record AccessTokenPayload(
        Long userId,
        String email,
        OffsetDateTime expiresAt
) {
}
