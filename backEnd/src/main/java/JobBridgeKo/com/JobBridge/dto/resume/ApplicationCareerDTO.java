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
public class ApplicationCareerDTO {
    private Long idx;
    private String company;
    private String isWorking;
    private Date startDate;
    private Date endDate;
    private String contractType;
    private String role;
    private String position;
    private String department;
    private String description;
}
