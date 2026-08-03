package com.stillwriter.document.controller;

import com.stillwriter.auth.security.AuthenticatedUser;
import com.stillwriter.auth.security.CurrentUser;
import com.stillwriter.common.ApiResponse;
import com.stillwriter.document.dto.DocumentAutoSaveRequest;
import com.stillwriter.document.dto.DocumentAutoSaveResponse;
import com.stillwriter.document.dto.DocumentListItemResponse;
import com.stillwriter.document.dto.DocumentResponse;
import com.stillwriter.document.dto.DocumentSaveRequest;
import com.stillwriter.document.dto.DocumentUpdateRequest;
import com.stillwriter.document.service.DocumentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<DocumentResponse>> create(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody DocumentSaveRequest request
    ) {
        DocumentResponse response = documentService.create(user.id(), request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("글이 생성되었습니다.", response));
    }

    @PostMapping("/autosave")
    public ResponseEntity<ApiResponse<DocumentAutoSaveResponse>> autoSave(
            @CurrentUser AuthenticatedUser user,
            @Valid @RequestBody DocumentAutoSaveRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("자동 저장되었습니다.", documentService.autoSave(user.id(), request))
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentListItemResponse>>> findAll(
            @CurrentUser AuthenticatedUser user
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("글 목록을 조회했습니다.", documentService.findAll(user.id()))
        );
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<ApiResponse<DocumentResponse>> findOne(
            @CurrentUser AuthenticatedUser user,
            @PathVariable Long documentId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("글을 조회했습니다.", documentService.findOne(user.id(), documentId))
        );
    }

    @PatchMapping("/{documentId}")
    public ResponseEntity<ApiResponse<DocumentResponse>> update(
            @CurrentUser AuthenticatedUser user,
            @PathVariable Long documentId,
            @Valid @RequestBody DocumentUpdateRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success("글이 저장되었습니다.", documentService.update(user.id(), documentId, request))
        );
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @CurrentUser AuthenticatedUser user,
            @PathVariable Long documentId
    ) {
        documentService.delete(user.id(), documentId);
        return ResponseEntity.ok(ApiResponse.success("글이 휴지통으로 이동되었습니다.", null));
    }
}
