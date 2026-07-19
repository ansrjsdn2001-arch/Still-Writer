package com.stillwriter.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 이메일 인증 코드 발송 요청입니다.
 */
public record EmailVerificationSendRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 191, message = "이메일은 최대 191자까지 입력할 수 있습니다.")
        String email
) {
}
