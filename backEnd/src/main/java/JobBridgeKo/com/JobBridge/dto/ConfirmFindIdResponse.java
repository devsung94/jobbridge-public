package JobBridgeKo.com.JobBridge.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmFindIdResponse {
    private String result;
    private String userId;
    private String message;
}
