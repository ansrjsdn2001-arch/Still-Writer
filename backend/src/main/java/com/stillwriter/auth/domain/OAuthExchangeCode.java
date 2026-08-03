package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * OAuth 일회용 교환 코드 검증에 사용하는 조회 결과입니다.
 */
public class OAuthExchangeCode {

    private Long id;
    private Long userId;
    private String provider;
    private OffsetDateTime expiresAt;
    private OffsetDateTime consumedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getProvider() {
        return provider;
    }

    public void setProvider(String provider) {
        this.provider = provider;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public OffsetDateTime getConsumedAt() {
        return consumedAt;
    }

    public void setConsumedAt(OffsetDateTime consumedAt) {
        this.consumedAt = consumedAt;
    }
}
