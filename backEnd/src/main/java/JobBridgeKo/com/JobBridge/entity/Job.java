package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "jobs",
        indexes = {
                @Index(name = "idx_jobs_is_use", columnList = "jo_is_use"),
                @Index(name = "idx_jobs_title", columnList = "jo_title")
        }
)
public class Job {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "jo_idx")
    private Long idx;

    @Column(name = "jo_mb_id", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Column(name = "jo_title")
    private String title;

    @Column(name = "jo_description", columnDefinition = "LONGTEXT")
    private String description;

    @Column(name = "jo_experience")
    private String experience;

    @Column(name = "jo_education")
    private String education;

    @Column(name = "jo_salary")
    private String salary;

    @Column(name = "jo_preferred")
    private String preferred;

    @Enumerated(EnumType.STRING) // ← ENUM 값을 문자열로 매핑 (Y, N)
    @Column(name = "jo_is_use", columnDefinition = "ENUM('Y','N') DEFAULT 'Y'")
    private UseStatus isUse;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "jo_start_date")
    private Date startDate;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "jo_end_date")
    private Date endDate;

    @Column(name = "jo_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "jo_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    @OneToMany(mappedBy = "job")
    private List<JobApplication> applications;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jo_mb_id", referencedColumnName = "com_mb_id", insertable = false, updatable = false)
    private Company company;

    public static Job create(String userId, JobDTO dto) {
        return new Job(
                null,
                userId,
                dto.getTitle(),
                dto.getDescription(),
                dto.getExperience(),
                dto.getEducation(),
                dto.getSalary(),
                dto.getPreferred(),
                UseStatus.Y,
                dto.getStartDate(),
                dto.getEndDate(),
                LocalDateTime.now(), // applications 필드는 null 또는 빈 리스트
                null,
                null,
                null
        );
    }

}
