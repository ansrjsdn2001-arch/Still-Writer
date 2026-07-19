package com.stillwriter.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * 회원가입 요청 DTO입니다.
 * 클라이언트가 보낸 원본 값을 먼저 검증하고, 실제 저장 전 Service에서 이메일 정규화를 한 번 더 수행합니다.
 */
public record SignupRequest(
        @NotBlank(message = "이메일은 필수입니다.")
        @Email(message = "올바른 이메일 형식이 아닙니다.")
        @Size(max = 191, message = "이메일은 최대 191자까지 입력할 수 있습니다.")
        String email,

        @NotBlank(message = "비밀번호는 필수입니다.")
        @Size(min = 8, max = 72, message = "비밀번호는 8자 이상 72자 이하로 입력해 주세요.")
        String password,

        @NotBlank(message = "닉네임은 필수입니다.")
        @Size(min = 2, max = 50, message = "닉네임은 2자 이상 50자 이하로 입력해 주세요.")
        @Pattern(
                regexp = "^[가-힣a-zA-Z0-9_\\- ]+$",
                message = "닉네임은 한글, 영문, 숫자, 공백, 하이픈, 밑줄만 사용할 수 있습니다."
        )
        String nickname
) {
}
