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
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "nt_idx")
    private Long idx;

    // 받는 회원 IDX
    @Column(name = "nt_sender_idx")
    private Long senderIdx;

    // 받는 회원 IDX
    @Column(name = "nt_receiver_idx")
    private Long receiverIdx;

    @Column(name = "nt_message")
    private String message;

    @Column(name = "nt_link")
    private String link; // 알림 클릭 시 이동할 URL

    @Column(name = "nt_ip")
    private String ip;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    @Column(name = "nt_is_read", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus isRead;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    @Column(name = "nt_is_use", columnDefinition = "ENUM('Y','N') DEFAULT 'Y'")
    private UseStatus isUse;

    @Column(name = "nt_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "nt_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    @PrePersist
    protected void onCreate() {
        this.regDate = LocalDateTime.now();
    }
}

