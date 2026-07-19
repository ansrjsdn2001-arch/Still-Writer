package com.stillwriter.auth.domain;

/**
 * Google UserInfo Endpoint에서 조회한 사용자 프로필입니다.
 */
public record GoogleUserInfo(
        String sub,
        String email,
        Boolean emailVerified,
        String name,
        String picture
) {
}
