package com.stillwriter.auth.domain;

/**
 * 소셜 로그인으로 처음 가입하는 사용자 정보입니다.
 * 소셜 전용 사용자는 비밀번호를 사용하지 않으므로 password_hash를 NULL로 저장합니다.
 */
public class NewSocialUser {

    private Long id;
    private final String email;
    private final String nickname;

    public NewSocialUser(String email, String nickname) {
        this.email = email;
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

    public String getNickname() {
        return nickname;
    }
}
