package com.stillwriter.document.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DocumentUpdateRequest(
        @NotNull(message = "수정 기준 revision은 필수입니다.")
        Long expectedRevision,

        @Size(max = 50, message = "제목은 최대 50자까지 입력할 수 있습니다.")
        String title,

        String contentHtml,

        String plainText
) {
}
