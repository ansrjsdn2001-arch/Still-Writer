package com.stillwriter.document.dto;

public record DocumentAutoSaveResponse(
        DocumentResponse document,
        boolean duplicateRequest,
        int versionNo
) {
}
