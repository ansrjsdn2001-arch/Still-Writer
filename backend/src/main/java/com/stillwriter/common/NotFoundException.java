package com.stillwriter.common;

/**
 * 요청한 리소스가 없거나 현재 사용자에게 노출할 수 없을 때 사용합니다.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
