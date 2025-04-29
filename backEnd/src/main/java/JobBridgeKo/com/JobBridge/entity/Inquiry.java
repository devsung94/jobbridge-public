package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.enums.InquiryStatus;
import JobBridgeKo.com.JobBridge.enums.InquiryType;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "inquiry")
public class Inquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "iq_idx")
    private Long idx;

    @Column(name = "iq_mb_id", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    @Column(name = "iq_type", columnDefinition = "ENUM('inquiry','answer') DEFAULT 'inquiry'")
    private InquiryType inquiryType;

    @Column(name = "iq_parents_idx")
    private Long parentsIdx;

    @Column(name = "iq_title")
    private String title;

    @Lob
    @Column(name = "iq_content")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "iq_answer_status", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus status;

    @Enumerated(EnumType.STRING)
    @Column(name = "iq_is_use", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus isUse;

    @Column(name = "iq_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "iq_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;
}
