package com.stillwriter.auth.security;

/**
 * 인증된 요청에서 컨트롤러가 사용할 현재 사용자 정보입니다.
 */
public record AuthenticatedUser(
        Long id,
        String email,
        String nickname
) {
}
