package com.stillwriter.auth.domain;

/**
 * Kakao 사용자 정보 조회 API 응답에서 로그인 처리에 필요한 값만 분리한 도메인 객체입니다.
 */
public record KakaoUserInfo(
        String id,
        String email,
        String nickname
) {
}
