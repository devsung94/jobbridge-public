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
public class ApplicationSkill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ask_idx")
    private Long idx;

    @Column(name = "ask_name")
    private String skillName;

    @ManyToOne
    @JoinColumn(name = "jar_idx")
    private JobApplicationResume AppResumeIdx;
}

