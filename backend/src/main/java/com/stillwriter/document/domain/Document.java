package com.stillwriter.document.domain;

import java.time.OffsetDateTime;

public class Document {

    private Long id;
    private Long userId;
    private Long folderId;
    private String type;
    private String title;
    private String contentJson;
    private String plainText;
    private Integer charCount;
    private Integer charCountWithoutSpaces;
    private Integer wordCount;
    private Integer sentenceCount;
    private String status;
    private Long revision;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getFolderId() { return folderId; }
    public void setFolderId(Long folderId) { this.folderId = folderId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }
    public String getPlainText() { return plainText; }
    public void setPlainText(String plainText) { this.plainText = plainText; }
    public Integer getCharCount() { return charCount; }
    public void setCharCount(Integer charCount) { this.charCount = charCount; }
    public Integer getCharCountWithoutSpaces() { return charCountWithoutSpaces; }
    public void setCharCountWithoutSpaces(Integer charCountWithoutSpaces) { this.charCountWithoutSpaces = charCountWithoutSpaces; }
    public Integer getWordCount() { return wordCount; }
    public void setWordCount(Integer wordCount) { this.wordCount = wordCount; }
    public Integer getSentenceCount() { return sentenceCount; }
    public void setSentenceCount(Integer sentenceCount) { this.sentenceCount = sentenceCount; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Long getRevision() { return revision; }
    public void setRevision(Long revision) { this.revision = revision; }
    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}
