package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.entity.Visitor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminVisitorDTO {
    private Long idx;
    private String ipAddress;
    private String path;
    private String userAgent;
    private String regDate; // String으로 변환

    public static AdminVisitorDTO fromEntity(Visitor visitor) {
        return AdminVisitorDTO.builder()
                .idx(visitor.getIdx())
                .ipAddress(visitor.getIpAddress())
                .path(visitor.getPath())
                .userAgent(visitor.getUserAgent())
                .regDate(visitor.getRegDate() != null ? visitor.getRegDate().toString() : null)
                .build();
    }
}
