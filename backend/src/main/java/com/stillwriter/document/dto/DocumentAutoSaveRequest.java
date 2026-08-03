package com.stillwriter.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record DocumentAutoSaveRequest(
        Long documentId,
        Long expectedRevision,

        @NotNull(message = "자동 저장 요청 ID는 필수입니다.")
        UUID saveRequestId,

        @Size(max = 50, message = "제목은 최대 50자까지 입력할 수 있습니다.")
        String title,

        @Size(max = 10, message = "글 유형이 올바르지 않습니다.")
        String type,

        String contentHtml,
        String plainText
) {
}
