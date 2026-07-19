package com.stillwriter.auth.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * 이메일 인증 코드를 생성합니다.
 * 예측 가능한 java.util.Random 대신 보안 목적에 적합한 SecureRandom을 사용합니다.
 */
@Component
public class VerificationCodeGenerator {

    private static final char[] CODE_CHARACTERS =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".toCharArray();

    private final SecureRandom secureRandom = new SecureRandom();

    public String generate(int length) {
        StringBuilder code = new StringBuilder(length);

        for (int index = 0; index < length; index++) {
            int randomIndex = secureRandom.nextInt(CODE_CHARACTERS.length);
            code.append(CODE_CHARACTERS[randomIndex]);
        }

        return code.toString();
    }
}
