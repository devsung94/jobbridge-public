package JobBridgeKo.com.JobBridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class StatsResponseDTO {
    private List<String> labels;
    private List<Integer> dailySignups;
    private List<Integer> totalUsers;
}
