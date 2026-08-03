package com.stillwriter.document.dto;

import jakarta.validation.constraints.Size;

public record DocumentSaveRequest(
        @Size(max = 50, message = "제목은 최대 50자까지 입력할 수 있습니다.")
        String title,

        @Size(max = 10, message = "글 유형이 올바르지 않습니다.")
        String type,

        String contentHtml,

        String plainText
) {
}
