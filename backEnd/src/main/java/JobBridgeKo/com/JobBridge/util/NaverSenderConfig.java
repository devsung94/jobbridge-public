package JobBridgeKo.com.JobBridge.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class NaverSenderConfig {

    @Value("${mail.naver.host}")
    private String host;

    @Value("${mail.naver.port}")
    private int port;

    @Value("${mail.naver.username}")
    private String username;

    @Value("${mail.naver.password}")
    private String password;

    @Value("${mail.naver.from}")
    private String from;

    @Bean("naverMailSender")
    public JavaMailSender naverMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.smtp.from", from);
        props.put("mail.debug", "true");

        return sender;
    }
}
