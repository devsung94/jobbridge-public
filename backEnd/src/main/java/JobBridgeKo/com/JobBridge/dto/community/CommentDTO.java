package JobBridgeKo.com.JobBridge.dto.community;

import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {

    private Long idx;                           // 댓글 ID
    private Long communityIdx;                  // 게시물 ID
    private String userId;                      // 작성자ID
    private String userName;                    // 작성자명
    private String content;                     // 댓글 내용
    private CommunityStatus.IsUse isUse;        // 삭제 여부
    private LocalDateTime regDate;              // 작성일
    private LocalDateTime editDate;             // 수정일

    private Long parentId;                      // 대댓글일 경우 부모 댓글 ID
    private List<CommentDTO> replies;           // 대댓글 목록 (옵션, 계층적으로 내려보낼 경우)

}
