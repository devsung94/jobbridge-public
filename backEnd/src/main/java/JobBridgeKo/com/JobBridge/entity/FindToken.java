package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

// FindToken.java
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "find_token")
public class FindToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ft_idx")
    private Long idx;

    @Column(name = "ft_token", unique = true)
    private String token;

    @Column(name = "ft_email", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String email;

    @Column(name = "ft_mb_id")
    private String userId;

    @Enumerated(EnumType.STRING) // 이게 꼭 있어야 문자열 Y/N으로 저장됨
    @Column(name = "ft_confirmed", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus confirmed; // 'Y' or 'N'

    @Column(name = "ft_expired", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime expiresAt;

    @Column(name = "ft_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "ft_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    public boolean isExpired() {
        return expiresAt.isBefore(LocalDateTime.now());
    }
}

