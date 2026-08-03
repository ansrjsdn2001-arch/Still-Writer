package com.stillwriter.document.dto;

import java.time.OffsetDateTime;

public record DocumentResponse(
        Long id,
        String type,
        String title,
        String contentHtml,
        String plainText,
        int charCount,
        int charCountWithoutSpaces,
        int wordCount,
        int sentenceCount,
        long revision,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
