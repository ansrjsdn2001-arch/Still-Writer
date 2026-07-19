package com.stillwriter.common;

/**
 * 이미 사용 중인 이메일, 닉네임처럼 고유해야 하는 값이 중복될 때 사용하는 예외입니다.
 */
public class DuplicateResourceException extends RuntimeException {

    public DuplicateResourceException(String message) {
        super(message);
    }
}
