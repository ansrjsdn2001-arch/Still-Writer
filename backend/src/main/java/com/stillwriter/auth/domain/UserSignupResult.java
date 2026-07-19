package com.stillwriter.auth.domain;

import java.time.OffsetDateTime;

/**
 * 회원가입 직후 클라이언트에 반환할 사용자 정보입니다.
 * MyBatis가 SELECT 결과를 안전하게 채울 수 있도록 기본 생성자와 setter를 제공합니다.
 */
public class UserSignupResult {

    private Long id;
    private String email;
    private String nickname;
    private String status;
    private OffsetDateTime createdAt;

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

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
