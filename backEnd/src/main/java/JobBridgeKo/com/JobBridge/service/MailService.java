package JobBridgeKo.com.JobBridge.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Qualifier;
import lombok.extern.slf4j.Slf4j;


@Slf4j
@Service
public class MailService {

    private final JavaMailSender gmailSender;
    private final JavaMailSender naverSender;

    @Value("${app.front.domain}")
    private String domain;

    public MailService(
            @Qualifier("gmailMailSender") JavaMailSender gmailSender,
            @Qualifier("naverMailSender") JavaMailSender naverSender
    ) {
        this.gmailSender = gmailSender;
        this.naverSender = naverSender;
    }

    public void sendFindIdMail(String email, String token, String type) {
        String link = domain + "/find-idpw/found-id?token=" + token;

        String htmlContent = String.format("""
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2 style="color: #3b82f6;">안녕하세요, JobBridge입니다.</h2>
                <p>아래 버튼을 클릭하면 아이디를 확인할 수 있습니다.</p>
                <a href="%s" style="
                    display: inline-block;
                    padding: 10px 20px;
                    margin-top: 10px;
                    background-color: #3b82f6;
                    color: white;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;">
                    👉 아이디 확인하기
                </a>
                <p style="margin-top: 20px; color: #999;">본 메일은 10분간 유효합니다.</p>
            </div>
        """, link);

        try {
            JavaMailSender sender = switch (type.toLowerCase()) {
                case "gmail" -> gmailSender;
                case "naver" -> naverSender;
                default -> throw new IllegalArgumentException("지원하지 않는 메일 타입입니다.");
            };

            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("아이디 찾기 안내");
            helper.setText(htmlContent, true);

            // 발신자 주소 지정
            if ("gmail".equalsIgnoreCase(type)) {
                helper.setFrom("devsung1994@gmail.com");
            } else if ("naver".equalsIgnoreCase(type)) {
                helper.setFrom("devsung94@naver.com");
            }

            sender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("메일 전송 중 오류 발생: {}", e.getMessage(), e); // 💡 로그로 기록 (선택)
            throw new RuntimeException("메일 전송 실패", e);
        }
    }

    public void sendResetPasswordMail(String email, String token, String type) {
        String link = domain + "/find-idpw/reset-password?token=" + token;

        String htmlContent = """
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #3b82f6;">안녕하세요, JobBridge입니다.</h2>
            <p>아래 버튼을 클릭하여 비밀번호를 재설정해주세요.</p>
            <a href="%s" style="
                display: inline-block;
                padding: 10px 20px;
                margin-top: 10px;
                background-color: #3b82f6;
                color: white;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;">
                👉 비밀번호 재설정
            </a>
            <p style="margin-top: 20px; color: #999;">본 메일은 10분간 유효합니다.</p>
        </div>
    """.formatted(link);

        try {
            JavaMailSender sender = switch (type.toLowerCase()) {
                case "gmail" -> gmailSender;
                case "naver" -> naverSender;
                default -> throw new IllegalArgumentException("지원하지 않는 메일 타입입니다.");
            };

            MimeMessage mimeMessage = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setTo(email);
            helper.setSubject("비밀번호 재설정 안내");
            helper.setText(htmlContent, true);

            // 발신자 주소 지정
            if ("gmail".equalsIgnoreCase(type)) {
                helper.setFrom("devsung1994@gmail.com");
            } else if ("naver".equalsIgnoreCase(type)) {
                helper.setFrom("devsung94@naver.com");
            }

            sender.send(mimeMessage);
        } catch (MessagingException e) {
            throw new RuntimeException("메일 전송 실패", e);
        }
    }

}
