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
public class ApplicationEducationDTO {
    private Long idx;
    private String schoolName;
    private String graduationStatus;
    private Date startDate;
    private Date endDate;
}
