package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_applications")
public class JobApplication {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sp_idx")
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sp_job_idx", referencedColumnName = "jo_idx", nullable = false) // 외래키 설정
    private Job job;

    @Column(name = "sp_mb_id", nullable = false, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "sp_is_read", nullable = false, columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private UseStatus isRead;

    @Enumerated(EnumType.STRING)
    @Column(name = "sp_is_use", nullable = false, columnDefinition = "ENUM('Y','N') DEFAULT 'Y'")
    private UseStatus isUse;

    @Enumerated(EnumType.STRING)
    @Column(name = "sp_is_status", nullable = false, columnDefinition = "ENUM('W','Y','N','C') DEFAULT 'W'")
    private JobApplicationStatus isStatus;

    @Column(name = "sp_cancel_date")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime cancelDate;

    @Column(name = "sp_read_date")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime readDate;

    @Column(name = "sp_reg_date")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "sp_edit_date")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    // JobApplication.java
    public static JobApplication create(Job job, String userId) {
        return new JobApplication(
                null,
                job,
                userId,
                UseStatus.N,
                UseStatus.Y,
                JobApplicationStatus.W,
                null,
                null,
                LocalDateTime.now(),
                null
        );
    }

}
