package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.entity.resume.*;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rs_idx")
    private Long idx;

    @Column(name = "rs_mb_id", nullable = false, unique = true, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Column(name = "rs_photo")
    private String photo; // 사진 파일의 URL 또는 경로

    @Column(name = "rs_experience")
    private String isExperienced; // 경력/신입 선택

    @Column(name = "rs_career_summary", columnDefinition = "TEXT")
    private String careerSummary;

    @Column(name = "rs_cover_letter", columnDefinition = "TEXT")
    private String coverLetter;

    @Column(name = "rs_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "rs_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    @Builder.Default
    @OneToMany(mappedBy = "resumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Career> careers = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educationList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Skill> skillsList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Portfolio> portfolioList = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "resumeIdx", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certificationsList = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rs_mb_id", referencedColumnName = "mb_id", insertable = false, updatable = false)
    private Member member;


}

