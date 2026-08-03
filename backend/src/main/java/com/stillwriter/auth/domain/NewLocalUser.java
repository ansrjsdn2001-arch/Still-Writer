package com.stillwriter.auth.domain;

/**
 * users 테이블에 새 LOCAL 회원을 저장하기 위한 값 객체입니다.
 */
public class NewLocalUser {

    private Long id;
    private final String email;
    private final String passwordHash;
    private final String nickname;

    public NewLocalUser(String email, String passwordHash, String nickname) {
        if (passwordHash == null || passwordHash.isBlank()) {
            throw new IllegalArgumentException("LOCAL 회원의 비밀번호 해시는 필수입니다.");
        }

        this.email = email;
        this.passwordHash = passwordHash;
        this.nickname = nickname;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getNickname() {
        return nickname;
    }
}
