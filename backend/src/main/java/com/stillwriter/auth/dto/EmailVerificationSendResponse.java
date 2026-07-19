package com.stillwriter.auth.dto;

import java.time.OffsetDateTime;

/**
 * 이메일 인증 코드 발송 성공 응답입니다.
 */
public record EmailVerificationSendResponse(
        String email,
        OffsetDateTime expiresAt
) {
}
