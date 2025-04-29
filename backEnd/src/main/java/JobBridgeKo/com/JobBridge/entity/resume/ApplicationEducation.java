package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.JobApplicationResume;
import JobBridgeKo.com.JobBridge.entity.Resume;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationEducation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "aec_idx")
    private Long idx;

    @Column(name = "aec_schoolName")
    private String schoolName;

    @Column(name = "aec_graduationStatus")
    private String graduationStatus;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "aec_start_date")
    private Date startDate;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "aec_end_date")
    private Date endDate;

    @ManyToOne
    @JoinColumn(name = "jar_idx")
    private JobApplicationResume AppResumeIdx;
}

