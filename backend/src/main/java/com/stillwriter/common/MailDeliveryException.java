package com.stillwriter.common;

/**
 * 이메일 발송 설정 누락 또는 SMTP 발송 실패 시 사용하는 예외입니다.
 * 실제 SMTP 오류 상세는 서버 콘솔에만 남기고, 클라이언트에는 안전한 메시지만 반환합니다.
 */
public class MailDeliveryException extends RuntimeException {

    public MailDeliveryException(String message) {
        super(message);
    }

    public MailDeliveryException(String message, Throwable cause) {
        super(message, cause);
    }
}
