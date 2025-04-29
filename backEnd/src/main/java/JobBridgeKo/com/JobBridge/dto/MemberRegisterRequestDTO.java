package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.enums.GenderType;
import jakarta.persistence.Column;
import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
public class MemberRegisterRequestDTO {
    private String role;
    private String userId;
    private String password;
    private String rePassword;
    private GenderType gender;
    private String birthDay;
    private String name;
    private String email;
    private String hp;
    private String zipCode;
    private String address;
    private String addressDetail;

    private boolean termsAgreed;         // 서비스 이용약관 동의
    private boolean privacyAgreed;       // 개인정보처리방침 동의

}
