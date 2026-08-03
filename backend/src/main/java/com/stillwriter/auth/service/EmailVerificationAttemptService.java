package com.stillwriter.auth.service;

import com.stillwriter.auth.mapper.EmailVerificationMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * 이메일 인증 시도 횟수 증가를 독립 트랜잭션으로 커밋합니다.
 * 검증 실패 예외로 바깥 트랜잭션이 롤백되어도 attempt_count는 보존됩니다.
 */
@Service
public class EmailVerificationAttemptService {

    private final EmailVerificationMapper emailVerificationMapper;

    public EmailVerificationAttemptService(EmailVerificationMapper emailVerificationMapper) {
        this.emailVerificationMapper = emailVerificationMapper;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public int increaseAttemptCount(String email, String purpose, int maxAttempts) {
        return emailVerificationMapper.increaseLatestAttemptCount(email, purpose, maxAttempts);
    }
}
