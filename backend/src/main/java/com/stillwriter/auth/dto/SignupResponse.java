package com.stillwriter.auth.dto;

import java.time.OffsetDateTime;

/**
 * 회원가입 성공 응답 DTO입니다.
 * password_hash 같은 민감 정보는 절대 응답하지 않습니다.
 */
public record SignupResponse(
        Long userId,
        String email,
        String nickname,
        String status,
        OffsetDateTime createdAt
) {
}
