package com.stillwriter.auth.mapper;

import com.stillwriter.auth.domain.NewLocalUser;
import com.stillwriter.auth.domain.LoginUser;
import com.stillwriter.auth.domain.NewOAuthExchangeCode;
import com.stillwriter.auth.domain.NewSocialUser;
import com.stillwriter.auth.domain.NewUserSession;
import com.stillwriter.auth.domain.OAuthExchangeCode;
import com.stillwriter.auth.domain.UserSession;
import com.stillwriter.auth.domain.UserSignupResult;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Optional;

/**
 * 인증 도메인에서 사용하는 DB 접근 Mapper입니다.
 * SQL은 resources/mapper/auth/AuthMapper.xml에 분리해 관리합니다.
 */
@Mapper
public interface AuthMapper {

    boolean existsUserByEmail(@Param("email") String email);

    boolean existsUserByNickname(@Param("nickname") String nickname);

    void insertLocalUser(NewLocalUser user);

    void insertLocalIdentity(@Param("userId") Long userId,
                             @Param("providerUserId") String providerUserId,
                             @Param("providerEmail") String providerEmail);

    void insertOAuthIdentity(@Param("userId") Long userId,
                             @Param("provider") String provider,
                             @Param("providerUserId") String providerUserId,
                             @Param("providerEmail") String providerEmail);

    void insertDefaultUserSettings(@Param("userId") Long userId);

    void insertSocialUser(NewSocialUser user);

    Optional<UserSignupResult> findSignupResultById(@Param("userId") Long userId);

    Optional<LoginUser> findLoginUserByEmail(@Param("email") String email);

    Optional<LoginUser> findLoginUserByProvider(@Param("provider") String provider,
                                                @Param("providerUserId") String providerUserId);

    Optional<LoginUser> findLoginUserById(@Param("userId") Long userId);

    void insertUserSession(NewUserSession session);

    Optional<UserSession> findUserSessionByRefreshTokenHash(@Param("refreshTokenHash") String refreshTokenHash);

    int rotateRefreshToken(@Param("sessionId") Long sessionId,
                           @Param("oldRefreshTokenHash") String oldRefreshTokenHash,
                           @Param("newRefreshTokenHash") String newRefreshTokenHash,
                           @Param("expiresAt") java.time.OffsetDateTime expiresAt);

    int revokeUserSessionByRefreshTokenHash(@Param("refreshTokenHash") String refreshTokenHash,
                                            @Param("revokedAt") java.time.OffsetDateTime revokedAt);

    int revokeAllUserSessions(@Param("userId") Long userId,
                              @Param("revokedAt") java.time.OffsetDateTime revokedAt);

    void insertOAuthExchangeCode(NewOAuthExchangeCode exchangeCode);

    Optional<OAuthExchangeCode> findOAuthExchangeCodeByHash(@Param("codeHash") String codeHash);

    int consumeOAuthExchangeCode(@Param("id") Long id,
                                 @Param("consumedAt") java.time.OffsetDateTime consumedAt);

    void updateLastLoginAt(@Param("userId") Long userId);
}
