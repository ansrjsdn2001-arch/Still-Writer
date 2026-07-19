package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * email_verification_codes 테이블에 저장할 새 인증 코드 정보입니다.
 * 인증 코드 원문은 저장하지 않고 SHA-256 해시만 저장합니다.
 */
public class NewEmailVerificationCode {

    private final String email;
    private final String purpose;
    private final String codeHash;
    private final OffsetDateTime expiresAt;

    public NewEmailVerificationCode(String email, String purpose, String codeHash, OffsetDateTime expiresAt) {
        this.email = email;
        this.purpose = purpose;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
    }

    public String getEmail() {
        return email;
    }

    public String getPurpose() {
        return purpose;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }
}
