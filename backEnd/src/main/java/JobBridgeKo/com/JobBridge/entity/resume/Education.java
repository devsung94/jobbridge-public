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
public class Education {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ec_idx")
    private Long idx;

    @Column(name = "ec_schoolName")
    private String schoolName;

    @Column(name = "ec_graduationStatus")
    private String graduationStatus;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "ec_start_date")
    private Date startDate;

    // `DATE`로 변경하는 설정 추가
    @Temporal(TemporalType.DATE)
    @Column(name = "ec_end_date")
    private Date endDate;

    @ManyToOne
    @JoinColumn(name = "rs_idx")
    private Resume resumeIdx;
}

