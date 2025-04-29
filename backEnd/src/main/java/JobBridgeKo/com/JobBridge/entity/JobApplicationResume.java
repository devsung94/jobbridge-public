package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.entity.resume.*;
import JobBridgeKo.com.JobBridge.enums.GenderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Builder
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "job_applications_resume")
public class JobApplicationResume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "jar_idx")
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "jar_application_idx", referencedColumnName = "sp_idx", nullable = false) // 외래키 설정
    private JobApplication jobApplication;

    @Column(name = "jar_mb_id", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Column(name = "jar_photo")
    private String photo; // 사진 파일의 URL 또는 경로

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(M/W)으로 저장
    @Column(name = "jar_gender", nullable = false)
    private GenderType gender;

    @Column(name = "jar_birth", nullable = false)
    private String birthDay;

    @Column(name = "jar_name", nullable = false)
    private String name;

    @Column(name = "jar_email", nullable = false)
    private String email;

    @Column(name = "jar_hp", nullable = false)
    private String hp;

    @Column(name = "jar_zcode", nullable = false)
    private String zipCode;

    @Column(name = "jar_addr", nullable = false)
    private String address;

    @Column(name = "jar_addr2", nullable = false)
    private String addressDetail;

    @Column(name = "jar_experience")
    private String isExperienced; // 경력/신입 선택

    @Column(name = "jar_career_summary", columnDefinition = "TEXT")
    private String careerSummary;

    @Column(name = "jar_cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "jar_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "jar_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    @Builder.Default
    @OneToMany(mappedBy = "AppResumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationCareer> careers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "AppResumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationEducation> educationList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "AppResumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationSkill> skillsList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "AppResumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationPortfolio> portfolioList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "AppResumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ApplicationCertification> certificationsList = new ArrayList<>();

}
