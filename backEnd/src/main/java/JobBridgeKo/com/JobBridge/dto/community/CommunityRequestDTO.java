package JobBridgeKo.com.JobBridge.dto.community;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityRequestDTO {

    private String userId;
    private String userName;
    private String category;
    private String title;
    private String content;
    private String isAnonymous;
    private String isUse;
    private MultipartFile thumbnail;             // 썸네일 파일

    private List<String> tags;
    private List<MultipartFile> attachments;     // 첨부파일 목록

    private List<Long> deletedAttachmentIdxs;        // 삭제할 첨부파일 idx
    private List<Long> existingAttachmentIdxs;       // 유지할 첨부파일 idx
}
