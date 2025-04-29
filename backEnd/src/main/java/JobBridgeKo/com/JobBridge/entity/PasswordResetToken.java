// PasswordResetToken.java (Entity)
package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "reset_token")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rt_idx")
    private Long idx;

    @Column(name = "rt_token", unique = true)
    private String token;

    @Column(name = "rt_email", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String email;

    @Column(name = "rt_mb_id")
    private String userId;

    @Enumerated(EnumType.STRING) // 이게 꼭 있어야 문자열 Y/N으로 저장됨
    @Column(name = "rt_confirmed", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus confirmed; // Y, N

    @Column(name = "rt_expired", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;

    @Column(name = "rt_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "rt_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}