package com.stillwriter.document.service;

import com.stillwriter.common.ConflictException;
import com.stillwriter.common.NotFoundException;
import com.stillwriter.document.domain.Document;
import com.stillwriter.document.domain.NewDocument;
import com.stillwriter.document.dto.DocumentAutoSaveRequest;
import com.stillwriter.document.dto.DocumentAutoSaveResponse;
import com.stillwriter.document.dto.DocumentListItemResponse;
import com.stillwriter.document.dto.DocumentResponse;
import com.stillwriter.document.dto.DocumentSaveRequest;
import com.stillwriter.document.dto.DocumentUpdateRequest;
import com.stillwriter.document.mapper.DocumentMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class DocumentService {

    private static final Set<String> ALLOWED_TYPES = Set.of("NOVEL", "DIARY", "MEMO", "GENERAL");

    private final DocumentMapper documentMapper;
    private final ObjectMapper objectMapper;

    public DocumentService(DocumentMapper documentMapper, ObjectMapper objectMapper) {
        this.documentMapper = documentMapper;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public DocumentResponse create(Long userId, DocumentSaveRequest request) {
        PreparedDocument prepared = prepare(request.title(), request.type(), request.contentHtml(), request.plainText());

        NewDocument document = createNewDocument(userId, prepared);
        documentMapper.insertDocument(document);

        return documentMapper.findActiveDocumentByIdAndUserId(document.getId(), userId)
                .map(this::toResponse)
                .orElseThrow(() -> new IllegalStateException("생성한 글을 조회할 수 없습니다."));
    }

    @Transactional
    public DocumentAutoSaveResponse autoSave(Long userId, DocumentAutoSaveRequest request) {
        PreparedDocument prepared = prepare(request.title(), request.type(), request.contentHtml(), request.plainText());

        if (request.documentId() == null) {
            NewDocument newDocument = createNewDocument(userId, prepared);
            documentMapper.insertDocument(newDocument);

            int versionNo = insertVersion(newDocument.getId(), request.saveRequestId(), prepared, "AUTO");
            DocumentResponse response = findOne(userId, newDocument.getId());

            return new DocumentAutoSaveResponse(response, false, versionNo);
        }

        Document current = documentMapper.findActiveDocumentByIdAndUserIdForUpdate(request.documentId(), userId)
                .orElseThrow(() -> new NotFoundException("글을 찾을 수 없습니다."));

        if (documentMapper.existsDocumentVersionRequest(current.getId(), request.saveRequestId())) {
            return new DocumentAutoSaveResponse(toResponse(current), true, 0);
        }

        if (request.expectedRevision() == null || !request.expectedRevision().equals(current.getRevision())) {
            throw new ConflictException("다른 저장 내용이 먼저 반영되었습니다. 글을 다시 불러온 뒤 저장해 주세요.");
        }

        int updatedRows = documentMapper.updateDocument(
                current.getId(),
                userId,
                request.expectedRevision(),
                prepared.title(),
                prepared.contentJson(),
                prepared.plainText(),
                prepared.charCount(),
                prepared.charCountWithoutSpaces(),
                prepared.wordCount(),
                prepared.sentenceCount()
        );

        if (updatedRows != 1) {
            throw new ConflictException("자동 저장 중 글 상태가 변경되었습니다. 글을 다시 불러온 뒤 저장해 주세요.");
        }

        int versionNo = insertVersion(current.getId(), request.saveRequestId(), prepared, "AUTO");
        DocumentResponse response = findOne(userId, current.getId());

        return new DocumentAutoSaveResponse(response, false, versionNo);
    }

    @Transactional(readOnly = true)
    public List<DocumentListItemResponse> findAll(Long userId) {
        return documentMapper.findActiveDocumentsByUserId(userId)
                .stream()
                .map(this::toListItemResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public DocumentResponse findOne(Long userId, Long documentId) {
        return documentMapper.findActiveDocumentByIdAndUserId(documentId, userId)
                .map(this::toResponse)
                .orElseThrow(() -> new NotFoundException("글을 찾을 수 없습니다."));
    }

    @Transactional
    public DocumentResponse update(Long userId, Long documentId, DocumentUpdateRequest request) {
        PreparedDocument prepared = prepare(request.title(), null, request.contentHtml(), request.plainText());

        int updatedRows = documentMapper.updateDocument(
                documentId,
                userId,
                request.expectedRevision(),
                prepared.title(),
                prepared.contentJson(),
                prepared.plainText(),
                prepared.charCount(),
                prepared.charCountWithoutSpaces(),
                prepared.wordCount(),
                prepared.sentenceCount()
        );

        if (updatedRows != 1) {
            if (documentMapper.existsActiveDocumentByIdAndUserId(documentId, userId)) {
                throw new ConflictException("다른 저장 내용이 먼저 반영되었습니다. 글을 다시 불러온 뒤 저장해 주세요.");
            }
            throw new NotFoundException("글을 찾을 수 없습니다.");
        }

        return findOne(userId, documentId);
    }

    @Transactional
    public void delete(Long userId, Long documentId) {
        int updatedRows = documentMapper.softDeleteDocument(documentId, userId);
        if (updatedRows != 1) {
            throw new NotFoundException("글을 찾을 수 없습니다.");
        }
    }

    private NewDocument createNewDocument(Long userId, PreparedDocument prepared) {
        return new NewDocument(
                userId,
                prepared.type(),
                prepared.title(),
                prepared.contentJson(),
                prepared.plainText(),
                prepared.charCount(),
                prepared.charCountWithoutSpaces(),
                prepared.wordCount(),
                prepared.sentenceCount()
        );
    }

    private int insertVersion(Long documentId,
                              java.util.UUID saveRequestId,
                              PreparedDocument prepared,
                              String versionType) {
        int versionNo = documentMapper.findNextDocumentVersionNo(documentId);
        documentMapper.insertDocumentVersion(
                documentId,
                versionNo,
                saveRequestId,
                prepared.title(),
                prepared.contentJson(),
                prepared.plainText(),
                prepared.charCount(),
                versionType
        );
        return versionNo;
    }

    private PreparedDocument prepare(String title, String type, String contentHtml, String plainText) {
        String normalizedTitle = title == null ? "" : title.trim();
        String normalizedPlainText = plainText == null ? "" : plainText;
        String normalizedContentHtml = contentHtml == null ? "" : contentHtml;
        String normalizedType = type == null || type.isBlank() ? "GENERAL" : type.trim().toUpperCase();

        if (!ALLOWED_TYPES.contains(normalizedType)) {
            throw new IllegalArgumentException("지원하지 않는 글 유형입니다.");
        }

        if (normalizedTitle.length() > 50) {
            throw new IllegalArgumentException("제목은 최대 50자까지 입력할 수 있습니다.");
        }

        if (normalizedTitle.isBlank() && normalizedPlainText.trim().isBlank()) {
            throw new IllegalArgumentException("제목이나 본문 중 하나는 입력해야 합니다.");
        }

        int charCount = normalizedPlainText.length();
        int charCountWithoutSpaces = normalizedPlainText.replaceAll("\\s", "").length();
        int wordCount = calculateWordCount(normalizedPlainText);
        int sentenceCount = calculateSentenceCount(normalizedPlainText);
        String contentJson = toContentJson(normalizedContentHtml);

        return new PreparedDocument(
                normalizedTitle,
                normalizedType,
                contentJson,
                normalizedPlainText,
                charCount,
                charCountWithoutSpaces,
                wordCount,
                sentenceCount
        );
    }

    private int calculateWordCount(String plainText) {
        String trimmed = plainText.trim();
        return trimmed.isBlank() ? 0 : trimmed.split("\\s+").length;
    }

    private int calculateSentenceCount(String plainText) {
        String trimmed = plainText.trim();
        if (trimmed.isBlank()) {
            return 0;
        }
        return trimmed.split("[.!?。！？]+").length;
    }

    private String toContentJson(String contentHtml) {
        try {
            return objectMapper.writeValueAsString(Map.of(
                    "format", "html",
                    "html", contentHtml
            ));
        } catch (Exception exception) {
            throw new IllegalStateException("글 내용을 JSON으로 변환할 수 없습니다.", exception);
        }
    }

    private DocumentResponse toResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getType(),
                document.getTitle(),
                extractContentHtml(document.getContentJson()),
                document.getPlainText(),
                document.getCharCount(),
                document.getCharCountWithoutSpaces(),
                document.getWordCount(),
                document.getSentenceCount(),
                document.getRevision(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }

    private DocumentListItemResponse toListItemResponse(Document document) {
        String plainText = document.getPlainText() == null ? "" : document.getPlainText();
        String preview = plainText.length() <= 120 ? plainText : plainText.substring(0, 120);

        return new DocumentListItemResponse(
                document.getId(),
                document.getType(),
                document.getTitle(),
                preview,
                document.getCharCount(),
                document.getCharCountWithoutSpaces(),
                document.getRevision(),
                document.getCreatedAt(),
                document.getUpdatedAt()
        );
    }

    private String extractContentHtml(String contentJson) {
        if (contentJson == null || contentJson.isBlank()) {
            return "";
        }

        try {
            JsonNode root = objectMapper.readTree(contentJson);
            return root.path("html").asText("");
        } catch (Exception exception) {
            return "";
        }
    }

    private record PreparedDocument(
            String title,
            String type,
            String contentJson,
            String plainText,
            int charCount,
            int charCountWithoutSpaces,
            int wordCount,
            int sentenceCount
    ) {
    }
}
