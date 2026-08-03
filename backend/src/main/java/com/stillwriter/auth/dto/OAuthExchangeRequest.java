package com.stillwriter.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * OAuth 콜백 후 프론트가 Access Token을 교환하기 위해 전달하는 일회용 코드입니다.
 */
public record OAuthExchangeRequest(
        @NotBlank(message = "OAuth 교환 코드가 필요합니다.")
        @Size(max = 500, message = "OAuth 교환 코드가 너무 깁니다.")
        String code
) {
}
