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
public class ApplicationCareer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "acr_idx")
    private Long idx;

    @Column(name = "acr_company")
    private String company;

    @Column(name = "acr_is_working")
    private String isWorking;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "acr_start_date")
    private Date startDate;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "acr_end_date")
    private Date endDate;

    @Column(name = "acr_contract_type")
    private String contractType;

    @Column(name = "acr_role")
    private String role;

    @Column(name = "acr_position")
    private String position;

    @Column(name = "acr_department")
    private String department;

    @Column(name = "acr_description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "jar_idx")
    private JobApplicationResume AppResumeIdx;
}
