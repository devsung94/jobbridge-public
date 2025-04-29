package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.Resume;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Skill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "sk_idx")
    private Long idx;

    @Column(name = "sk_name")
    private String skillName;

    @ManyToOne
    @JoinColumn(name = "rs_idx")
    private Resume resumeIdx;
}

