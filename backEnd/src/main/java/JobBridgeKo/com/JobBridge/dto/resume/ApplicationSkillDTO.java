package JobBridgeKo.com.JobBridge.dto.resume;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationSkillDTO {
    private Long idx;
    private String skillName;
}
