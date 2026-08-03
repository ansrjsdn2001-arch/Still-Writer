package com.stillwriter.document.dto;

import java.time.OffsetDateTime;

public record DocumentListItemResponse(
        Long id,
        String type,
        String title,
        String preview,
        int charCount,
        int charCountWithoutSpaces,
        long revision,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt
) {
}
