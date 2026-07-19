package com.stillwriter.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 이메일 인증 코드 확인 요청입니다.
 */
public record EmailVerificationVerifyRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 191, message = "이메일은 최대 191자까지 입력할 수 있습니다.")
        String email,

        @NotBlank(message = "인증 코드는 필수입니다.")
        @Pattern(
                regexp = "^[A-Za-z0-9]{6}$",
                message = "인증 코드는 영문 대/소문자와 숫자로 이루어진 6자리여야 합니다."
        )
        String code
) {
}
