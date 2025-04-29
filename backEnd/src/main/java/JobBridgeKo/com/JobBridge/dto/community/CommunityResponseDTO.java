package JobBridgeKo.com.JobBridge.dto.community;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityResponseDTO {

    private Long idx;
    private String userId;
    private String userName;
    private String category;
    private String title;
    private String content;
    private boolean isAnonymous;
    private boolean isEdited;
    private String isUse;

    private int views;
    private int likes;
    private int commentsCount;

    private List<String> tags;
    private String thumbnailUrl;
    private List<String> attachments;

    private LocalDateTime regDate;
    private LocalDateTime editDate;

    private List<CommentDTO> comments;
}
