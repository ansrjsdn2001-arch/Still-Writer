package com.stillwriter.common;

/**
 * 현재 서버 상태와 요청의 전제 조건이 맞지 않을 때 사용합니다.
 */
public class ConflictException extends RuntimeException {

    public ConflictException(String message) {
        super(message);
    }
}
