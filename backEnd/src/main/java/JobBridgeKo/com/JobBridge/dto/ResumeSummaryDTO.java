package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResumeSummaryDTO {
    private Long idx;
    private Long resumeIdx;
    private String userId;
    private String userName;
    private String photo;
    private String isExperienced;  // "Y" or "N"
    private String careerSummary;
    private String birthDay;       // yyyy-MM-dd
    private UseStatus isUse;
    private JobApplicationStatus isStatus;
}

