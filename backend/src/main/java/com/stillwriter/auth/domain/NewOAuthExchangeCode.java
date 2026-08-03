package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * OAuth 성공 후 프론트에 전달할 일회용 교환 코드의 저장 정보입니다.
 * 원문 코드는 저장하지 않고 SHA-256 해시만 저장합니다.
 */
public class NewOAuthExchangeCode {

    private Long id;
    private final String codeHash;
    private final Long userId;
    private final String provider;
    private final OffsetDateTime expiresAt;

    public NewOAuthExchangeCode(String codeHash, Long userId, String provider, OffsetDateTime expiresAt) {
        this.codeHash = codeHash;
        this.userId = userId;
        this.provider = provider;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public Long getUserId() {
        return userId;
    }

    public String getProvider() {
        return provider;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }
}
