package JobBridgeKo.com.JobBridge.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

@Configuration
public class GmailSenderConfig {

    @Value("${mail.gmail.host}")
    private String host;

    @Value("${mail.gmail.port}")
    private int port;

    @Value("${mail.gmail.username}")
    private String username;

    @Value("${mail.gmail.password}")
    private String password;

    @Bean("gmailMailSender")
    public JavaMailSender gmailMailSender() {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(host);
        sender.setPort(port);
        sender.setUsername(username);
        sender.setPassword(password);

        Properties props = sender.getJavaMailProperties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.ssl.trust", host);
        props.put("mail.debug", "true");

        return sender;
    }
}
