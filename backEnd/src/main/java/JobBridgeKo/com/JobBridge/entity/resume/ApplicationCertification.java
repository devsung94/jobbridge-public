package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.JobApplicationResume;
import JobBridgeKo.com.JobBridge.entity.Resume;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationCertification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "act_description")
    private Long idx;

    @Column(name = "act_certificationName")
    private String certificationName;

    @ManyToOne
    @JoinColumn(name = "jar_idx")
    private JobApplicationResume AppResumeIdx;
}

