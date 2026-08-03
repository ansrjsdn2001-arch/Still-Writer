package com.stillwriter.common;

import java.time.Instant;
import java.util.Map;

/**
 * 예외 발생 시 프론트엔드가 일관되게 처리할 수 있는 오류 응답입니다.
 *
 * @param success 항상 false
 * @param message 오류 요약 메시지
 * @param errors 필드별 검증 오류. 검증 오류가 아니면 비어 있습니다.
 * @param timestamp 오류 발생 시각
 */
public record ErrorResponse(
        boolean success,
        String message,
        Map<String, String> errors,
    Instant timestamp
) {

    public static ErrorResponse of(String message) {
        return new ErrorResponse(false, message, null, Instant.now());
    }

    public static ErrorResponse of(String message, Map<String, String> errors) {
        return new ErrorResponse(false, message, errors, Instant.now());
    }
}
