package JobBridgeKo.com.JobBridge.dto.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationPortfolioDTO {
    private Long idx;
    private String portfolioUrl;
    private String portfolioContents;
}
