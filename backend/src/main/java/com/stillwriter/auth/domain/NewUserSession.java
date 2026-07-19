package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * user_sessions 테이블에 저장할 Refresh Token 세션 정보입니다.
 */
public class NewUserSession {

    private Long id;
    private final Long userId;
    private final String refreshTokenHash;
    private final String deviceName;
    private final String ipAddress;
    private final String userAgent;
    private final OffsetDateTime expiresAt;

    public NewUserSession(Long userId,
                          String refreshTokenHash,
                          String deviceName,
                          String ipAddress,
                          String userAgent,
                          OffsetDateTime expiresAt) {
        this.userId = userId;
        this.refreshTokenHash = refreshTokenHash;
        this.deviceName = deviceName;
        this.ipAddress = ipAddress;
        this.userAgent = userAgent;
        this.expiresAt = expiresAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRefreshTokenHash() {
        return refreshTokenHash;
    }

    public String getDeviceName() {
        return deviceName;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }
}
