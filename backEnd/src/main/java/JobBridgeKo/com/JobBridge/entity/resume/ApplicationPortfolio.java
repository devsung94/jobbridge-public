package JobBridgeKo.com.JobBridge.entity.resume;

import JobBridgeKo.com.JobBridge.entity.JobApplicationResume;
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
public class ApplicationPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "apf_idx")
    private Long idx;

    @Column(name = "apf_url")
    private String portfolioUrl;

    @Column(name = "apf_contents", columnDefinition = "TEXT")
    private String portfolioContents;

    @ManyToOne
    @JoinColumn(name = "jar_idx")
    private JobApplicationResume AppResumeIdx;
}

