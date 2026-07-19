package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * 이메일 인증 성공 결과입니다.
 */
public class VerifiedEmailCode {

    private Long id;
    private String email;
    private OffsetDateTime verifiedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public OffsetDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(OffsetDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
