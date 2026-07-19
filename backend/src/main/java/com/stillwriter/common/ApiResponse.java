package com.stillwriter.common;

/**
 * 클라이언트가 모든 API 응답을 같은 형태로 처리할 수 있게 하는 공통 응답 객체입니다.
 *
 * @param success 요청 성공 여부
 * @param message 사용자 또는 개발자가 확인할 수 있는 응답 메시지
 * @param data 실제 응답 데이터
 */
public record ApiResponse<T>(
        boolean success,
        String message,
        T data
) {

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data);
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message, null);
    }
}
