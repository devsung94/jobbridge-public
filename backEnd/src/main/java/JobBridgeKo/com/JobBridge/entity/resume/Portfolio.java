package JobBridgeKo.com.JobBridge.entity.resume;

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
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pf_idx")
    private Long idx;

    @Column(name = "pf_url")
    private String portfolioUrl;

    @Column(name = "pf_contents", columnDefinition = "TEXT")
    private String portfolioContents;

    @ManyToOne
    @JoinColumn(name = "rs_idx")
    private Resume resumeIdx;
}
