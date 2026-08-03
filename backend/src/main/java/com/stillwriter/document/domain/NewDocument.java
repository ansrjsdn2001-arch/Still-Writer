package com.stillwriter.document.domain;

public class NewDocument {

    private Long id;
    private final Long userId;
    private final String type;
    private final String title;
    private final String contentJson;
    private final String plainText;
    private final int charCount;
    private final int charCountWithoutSpaces;
    private final int wordCount;
    private final int sentenceCount;

    public NewDocument(Long userId,
                       String type,
                       String title,
                       String contentJson,
                       String plainText,
                       int charCount,
                       int charCountWithoutSpaces,
                       int wordCount,
                       int sentenceCount) {
        this.userId = userId;
        this.type = type;
        this.title = title;
        this.contentJson = contentJson;
        this.plainText = plainText;
        this.charCount = charCount;
        this.charCountWithoutSpaces = charCountWithoutSpaces;
        this.wordCount = wordCount;
        this.sentenceCount = sentenceCount;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public String getType() { return type; }
    public String getTitle() { return title; }
    public String getContentJson() { return contentJson; }
    public String getPlainText() { return plainText; }
    public int getCharCount() { return charCount; }
    public int getCharCountWithoutSpaces() { return charCountWithoutSpaces; }
    public int getWordCount() { return wordCount; }
    public int getSentenceCount() { return sentenceCount; }
}
