package com.stillwriter.auth.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

/**
 * Google Token Endpoint 응답 중 현재 로그인 처리에 필요한 값만 매핑합니다.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record OAuthTokenResponse(
        @JsonProperty("access_token")
        String accessToken,

        @JsonProperty("expires_in")
        Long expiresIn,

        @JsonProperty("token_type")
        String tokenType,

        String scope,

        @JsonProperty("id_token")
        String idToken
) {
}
