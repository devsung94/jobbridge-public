package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.enums.GenderType;
import JobBridgeKo.com.JobBridge.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "member")
public class Member {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "mb_idx")
    private Long idx;

    @Column(name = "mb_reg_type", nullable = false)
    private String role;

    @Column(name = "mb_id", nullable = false, unique = true, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Column(name = "mb_password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(M/W)으로 저장
    @Column(name = "mb_gender", nullable = false)
    private GenderType gender;

    @Column(name = "mb_birth", nullable = false)
    private String birthDay;

    @Column(name = "mb_name", nullable = false)
    private String name;

    @Column(name = "mb_email", nullable = false, unique = true, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String email;

    @Column(name = "mb_hp", nullable = false)
    private String hp;

    @Column(name = "mb_zcode", nullable = false)
    private String zipCode;

    @Column(name = "mb_addr", nullable = false)
    private String address;

    @Column(name = "mb_addr2", nullable = false)
    private String addressDetail;

    @Column(name = "access_token", length = 500)
    private String accessToken;

    @Column(name = "refresh_token", length = 500)
    private String refreshToken;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    @Column(name = "mb_use_status", nullable = false, columnDefinition = "ENUM('Y', 'N', 'T', 'B') DEFAULT 'Y'")
    private UserStatus isUse;

    @Column(name = "mb_ip")
    private String ip;

    @Column(name = "mb_login_datetime", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime lastLogin;

    @Column(name = "mb_terms_agreed", nullable = false)
    private boolean termsAgreed; // 서비스 이용약관 동의

    @Column(name = "mb_privacy_agreed", nullable = false)
    private boolean privacyAgreed; // 개인정보처리방침 동의

    @Column(name = "mb_agreed_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime agreedDate; // 동의 일시

    @Column(name = "mb_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "mb_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

}
