package com.stillwriter.auth.service;

import com.stillwriter.auth.domain.NewEmailVerificationCode;
import com.stillwriter.auth.domain.VerifiedEmailCode;
import com.stillwriter.auth.dto.EmailVerificationSendRequest;
import com.stillwriter.auth.dto.EmailVerificationSendResponse;
import com.stillwriter.auth.dto.EmailVerificationVerifyRequest;
import com.stillwriter.auth.dto.EmailVerificationVerifyResponse;
import com.stillwriter.auth.mapper.AuthMapper;
import com.stillwriter.auth.mapper.EmailVerificationMapper;
import com.stillwriter.common.DuplicateResourceException;
import com.stillwriter.common.MailDeliveryException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Locale;

/**
 * 회원가입 이메일 인증 코드 발송과 검증을 담당합니다.
 */
@Service
public class EmailVerificationService {

    private static final String SIGNUP_PURPOSE = "SIGNUP";

    private final EmailVerificationMapper emailVerificationMapper;
    private final EmailVerificationAttemptService attemptService;
    private final AuthMapper authMapper;
    private final JavaMailSender mailSender;
    private final VerificationCodeGenerator codeGenerator;
    private final String from;
    private final String mailHost;
    private final int mailPort;
    private final String mailUsername;
    private final String mailPassword;
    private final int codeLength;
    private final long expiresMinutes;
    private final int maxAttempts;

    public EmailVerificationService(
            EmailVerificationMapper emailVerificationMapper,
            EmailVerificationAttemptService attemptService,
            AuthMapper authMapper,
            JavaMailSender mailSender,
            VerificationCodeGenerator codeGenerator,
            @Value("${spring.mail.host}") String mailHost,
            @Value("${spring.mail.port}") int mailPort,
            @Value("${spring.mail.username}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword,
            @Value("${still-writer.email-verification.from}") String from,
            @Value("${still-writer.email-verification.code-length}") int codeLength,
            @Value("${still-writer.email-verification.expires-minutes}") long expiresMinutes,
            @Value("${still-writer.email-verification.max-attempts}") int maxAttempts
    ) {
        this.emailVerificationMapper = emailVerificationMapper;
        this.attemptService = attemptService;
        this.authMapper = authMapper;
        this.mailSender = mailSender;
        this.codeGenerator = codeGenerator;
        this.mailHost = mailHost;
        this.mailPort = mailPort;
        this.mailUsername = mailUsername;
        this.mailPassword = mailPassword;
        this.from = from;
        this.codeLength = codeLength;
        this.expiresMinutes = expiresMinutes;
        this.maxAttempts = maxAttempts;
    }

    /**
     * 회원가입 페이지에 입력된 이메일로 6자리 인증 코드를 발송합니다.
     */
    @Transactional
    public EmailVerificationSendResponse sendSignupCode(EmailVerificationSendRequest request) {
        String email = normalizeEmail(request.email());

        System.out.println("[EmailVerification] 인증 코드 발송 처리 시작 email=" + email);

        if (authMapper.existsUserByEmail(email)) {
            System.out.println("[EmailVerification] 인증 코드 발송 중단 - 이미 사용 중인 이메일 email=" + email);
            throw new DuplicateResourceException("이미 사용 중인 이메일입니다.");
        }

        validateMailSettings();

        String code = codeGenerator.generate(codeLength);
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMinutes(expiresMinutes);

        // TODO: 개발 중 인증 흐름 확인용 임시 로그입니다.
        // 운영 환경에서는 인증 코드 원문이 로그에 남으면 안 되므로 반드시 제거해야 합니다.
        System.out.println("[EmailVerification][DEV_ONLY] 인증 코드 원문"
                + " email=" + email
                + ", code=" + code
                + ", expiresAt=" + expiresAt);

        emailVerificationMapper.expirePendingCodes(email, SIGNUP_PURPOSE);
        emailVerificationMapper.insertVerificationCode(
                new NewEmailVerificationCode(email, SIGNUP_PURPOSE, sha256(code), expiresAt)
        );

        System.out.println("[EmailVerification] 인증 코드 DB 저장 완료 email=" + email
                + ", expiresAt=" + expiresAt);

        sendMail(email, code, expiresAt);

        System.out.println("[EmailVerification] 인증 메일 SMTP 발송 완료 email=" + email);

        return new EmailVerificationSendResponse(email, expiresAt);
    }

    /**
     * 사용자가 입력한 인증 코드가 최신 유효 코드와 일치하는지 확인합니다.
     */
    @Transactional
    public EmailVerificationVerifyResponse verifySignupCode(EmailVerificationVerifyRequest request) {
        String email = normalizeEmail(request.email());
        String codeHash = sha256(request.code());

        int increasedRows = attemptService.increaseAttemptCount(email, SIGNUP_PURPOSE, maxAttempts);
        if (increasedRows == 0) {
            throw new IllegalArgumentException("인증 코드가 올바르지 않거나 만료되었습니다.");
        }

        Long codeId = emailVerificationMapper.findValidCodeId(email, SIGNUP_PURPOSE, codeHash, maxAttempts)
                .orElseThrow(() -> new IllegalArgumentException("인증 코드가 올바르지 않거나 만료되었습니다."));

        OffsetDateTime verifiedAt = OffsetDateTime.now();
        emailVerificationMapper.markVerified(codeId, verifiedAt);

        VerifiedEmailCode verifiedCode = emailVerificationMapper.findVerifiedCodeById(codeId)
                .orElseThrow(() -> new IllegalStateException("인증 결과를 조회할 수 없습니다."));

        return new EmailVerificationVerifyResponse(verifiedCode.getEmail(), verifiedCode.getVerifiedAt());
    }

    private void sendMail(String to, String code, OffsetDateTime expiresAt) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(from);
        message.setTo(to);
        message.setSubject("[Still Writer] 이메일 인증 코드");
        message.setText("""
                Still Writer 회원가입 이메일 인증 코드입니다.

                인증 코드: %s

                이 코드는 %d분 동안만 사용할 수 있습니다.
                만료 시각: %s

                본인이 요청하지 않았다면 이 메일을 무시해 주세요.
                """.formatted(code, expiresMinutes, expiresAt));

        try {
            mailSender.send(message);
        } catch (MailException exception) {
            System.out.println("[EmailVerification] 인증 메일 SMTP 발송 실패"
                    + " host=" + mailHost
                    + ", port=" + mailPort
                    + ", username=" + mailUsername
                    + ", to=" + to
                    + ", exception=" + exception.getClass().getName()
                    + ", message=" + exception.getMessage());

            throw new MailDeliveryException("인증 메일 발송에 실패했습니다. 메일 설정을 확인해 주세요.", exception);
        }
    }

    private void validateMailSettings() {
        if (isBlank(mailHost) || mailPort <= 0 || isBlank(mailUsername) || isBlank(from)) {
            System.out.println("[EmailVerification] 인증 메일 발송 설정 누락"
                    + " host=" + mailHost
                    + ", port=" + mailPort
                    + ", username=" + mailUsername
                    + ", from=" + from);

            throw new MailDeliveryException("인증 메일 발송 설정이 완료되지 않았습니다.");
        }

        if (isBlank(mailPassword)) {
            System.out.println("[EmailVerification] 인증 메일 발송 설정 누락 - MAIL_PASSWORD가 비어 있습니다."
                    + " Gmail SMTP는 Google 앱 비밀번호가 필요합니다."
                    + " username=" + mailUsername);

            throw new MailDeliveryException("인증 메일 발송 설정이 완료되지 않았습니다. Gmail 앱 비밀번호를 확인해 주세요.");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 해시 알고리즘을 사용할 수 없습니다.", exception);
        }
    }
}
