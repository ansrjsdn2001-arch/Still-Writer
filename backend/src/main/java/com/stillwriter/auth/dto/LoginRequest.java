package com.stillwriter.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * LOCAL 로그인 요청 DTO입니다.
 */
public record LoginRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 191, message = "이메일은 최대 191자까지 입력할 수 있습니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(max = 72, message = "비밀번호는 최대 72자까지 입력할 수 있습니다.")
        String password
) {
}
