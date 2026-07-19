package com.stillwriter.common;

/**
 * 로그인 실패, 만료된 인증 정보처럼 인증이 되지 않은 요청을 표현하는 예외입니다.
 */
public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
