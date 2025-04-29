package JobBridgeKo.com.JobBridge.dto.community;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityFileDTO implements Serializable {
    private Long idx;
    private String fileUrl;
    private String fileName;
    private Long fileSize;
    private LocalDateTime regDate;
    private LocalDateTime editDate;
}
