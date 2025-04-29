package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.ConfirmFindIdResponse;
import JobBridgeKo.com.JobBridge.dto.FindIdRequestDTO;
import JobBridgeKo.com.JobBridge.entity.FindToken;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.PasswordResetToken;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.repository.FindTokenRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.repository.PasswordResetTokenRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final FindTokenRepository findTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final MemberRepository memberRepository;
    private final MailService mailService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public ConfirmFindIdResponse confirmFindId(String token) {
        return findTokenRepository.findByToken(token)
                .map(findToken -> {
                    if (findToken.isExpired()) {
                        return new ConfirmFindIdResponse("N", null, "링크가 만료되었습니다.");
                    }

                    findToken.setConfirmed(UseStatus.Y);
                    findToken.setEditDate(LocalDateTime.now());
                    findTokenRepository.save(findToken);

                    return new ConfirmFindIdResponse("Y", findToken.getUserId(), null);
                })
                .orElse(new ConfirmFindIdResponse("N", null, "유효하지 않은 토큰입니다."));
    }

    @Transactional
    public boolean sendFindIdLink(FindIdRequestDTO dto) {
        String email = dto.getEmail();

        // 이미 확인되지 않았고 유효한 토큰이 있다면 재발송 막기
        Optional<FindToken> existing = findTokenRepository.findByEmailAndConfirmedAndExpiresAtAfter(email, UseStatus.N, LocalDateTime.now());
        if (existing.isPresent()) {
            throw new IllegalStateException("이미 이메일이 발송되었습니다. 잠시 후 다시 시도해주세요.");
        }

        // 새 토큰 생성 및 저장
        String token = UUID.randomUUID().toString();
        String userId = memberRepository.findByEmail(email)
                .map(Member::getUserId)
                .orElseThrow(() -> new RuntimeException("해당 이메일로 가입된 사용자가 없습니다."));

        FindToken newToken = FindToken.builder()
                .token(token)
                .email(email)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .confirmed(UseStatus.N)
                .regDate(LocalDateTime.now().plusMinutes(10))
                .build();

        findTokenRepository.save(newToken);

        // 이메일 타입 자동 감지
        String mailType = email.endsWith("naver.com") ? "naver" : "gmail";

        mailService.sendFindIdMail(email, token, mailType);
        return true;
    }

    public String verifyResetToken(String token) {
        Optional<PasswordResetToken> opt = passwordResetTokenRepository.findByToken(token);
        if (opt.isEmpty()) {
            return "유효하지 않은 토큰입니다.";
        }
        PasswordResetToken resetToken = opt.get();
        if (resetToken.getConfirmed() == UseStatus.Y) {
            return "이미 비밀번호 재설정이 완료되었습니다.";
        }
        if (resetToken.isExpired()) {
            return "링크가 만료되었습니다.";
        }
        return "Y";
    }


    @Transactional
    public boolean updatePassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 토큰입니다."));

        if (resetToken.getConfirmed() == UseStatus.Y)
            throw new IllegalStateException("이미 비밀번호가 변경되었습니다.");

        if (resetToken.isExpired())
            throw new IllegalStateException("토큰이 만료되었습니다.");


        Member member = memberRepository.findByEmail(resetToken.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String encodedPassword = passwordEncoder.encode(newPassword);
        member.setPassword(encodedPassword); // 실제로는 암호화 필요
        memberRepository.save(member);

        resetToken.setConfirmed(UseStatus.Y);
        resetToken.setEditDate(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        return true;
    }


    @Transactional
    public void sendResetPasswordLink(FindIdRequestDTO dto) {
        String email = dto.getEmail();

        // 이미 확인되지 않은 유효한 토큰이 있으면 재전송 차단
        Optional<PasswordResetToken> existing = passwordResetTokenRepository.findByEmailAndConfirmedAndExpiresAtAfter(email, UseStatus.N, LocalDateTime.now());
        if (existing.isPresent()) {
            throw new IllegalStateException("이미 이메일이 발송되었습니다. 잠시 후 다시 시도해주세요.");
        }

        // 사용자 ID 확인
        String userId = memberRepository.findByEmail(email)
                .map(Member::getUserId)
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일로 가입된 계정이 없습니다."));

        String token = UUID.randomUUID().toString();

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .token(token)
                .email(email)
                .userId(userId)
                .expiresAt(LocalDateTime.now().plusMinutes(10))
                .confirmed(UseStatus.N)
                .regDate(LocalDateTime.now())
                .build();

        passwordResetTokenRepository.save(resetToken);

        String mailType = email.endsWith("naver.com") ? "naver" : "gmail";
        mailService.sendResetPasswordMail(email, token, mailType);
    }
}
