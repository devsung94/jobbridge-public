package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.Resume;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Career {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cr_idx")
    private Long idx;

    @Column(name = "cr_company")
    private String company;

    @Column(name = "cr_is_working")
    private String isWorking;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "cr_start_date")
    private Date startDate;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "cr_end_date")
    private Date endDate;

    @Column(name = "cr_contract_type")
    private String contractType;

    @Column(name = "cr_role")
    private String role;

    @Column(name = "cr_position")
    private String position;

    @Column(name = "cr_department")
    private String department;

    @Column(name = "cr_description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "rs_idx")
    private Resume resumeIdx;
}
