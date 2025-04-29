package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.Resume;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ct_description")
    private Long idx;

    @Column(name = "ct_certificationName")
    private String certificationName;

    @ManyToOne
    @JoinColumn(name = "rs_idx")
    private Resume resumeIdx;
}

