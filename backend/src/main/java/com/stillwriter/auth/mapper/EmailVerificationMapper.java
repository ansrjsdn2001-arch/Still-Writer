package com.stillwriter.auth.mapper;

import com.stillwriter.auth.domain.NewEmailVerificationCode;
import com.stillwriter.auth.domain.VerifiedEmailCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.time.OffsetDateTime;
import java.util.Optional;

/**
 * 이메일 인증 코드 저장과 검증을 담당하는 Mapper입니다.
 */
@Mapper
public interface EmailVerificationMapper {

    void expirePendingCodes(@Param("email") String email, @Param("purpose") String purpose);

    void insertVerificationCode(NewEmailVerificationCode verificationCode);

    int increaseAttemptCount(@Param("email") String email, @Param("purpose") String purpose);

    Optional<Long> findValidCodeId(@Param("email") String email,
                                   @Param("purpose") String purpose,
                                   @Param("codeHash") String codeHash);

    int markVerified(@Param("id") Long id, @Param("verifiedAt") OffsetDateTime verifiedAt);

    Optional<VerifiedEmailCode> findVerifiedCodeById(@Param("id") Long id);

    Optional<Long> findVerifiedSignupCodeId(@Param("email") String email, @Param("purpose") String purpose);

    int consumeVerifiedCode(@Param("id") Long id, @Param("consumedAt") OffsetDateTime consumedAt);
}
