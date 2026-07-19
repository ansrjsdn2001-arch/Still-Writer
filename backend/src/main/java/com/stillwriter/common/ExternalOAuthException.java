package com.stillwriter.common;

/**
 * 외부 OAuth 제공자와 통신하거나 응답을 검증하는 과정에서 발생한 예외입니다.
 */
public class ExternalOAuthException extends RuntimeException {

    public ExternalOAuthException(String message) {
        super(message);
    }

    public ExternalOAuthException(String message, Throwable cause) {
        super(message, cause);
    }
}
