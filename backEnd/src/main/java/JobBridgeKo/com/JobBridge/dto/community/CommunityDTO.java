package JobBridgeKo.com.JobBridge.dto.community;

import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityTag;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommunityDTO  implements Serializable {

    private Long idx;                       // 게시글 IDX
    private Long latestCommentId;           // 댓글 IDX
    private String userId;                  // 유저 ID
    private String userName;                // 유저명
    private String category;                // 카테고리 (자유, Q&A, 후기 등)
    private String title;                   // 제목
    private String content;                 // 본문
    private String thumbnailUrl;            // 썸네일 이미지 URL

    private String isAnonymous;            // 익명 여부
    private String isEdited;               // 수정 여부
    private String isUse;                   // 삭제 여부

    private int views;                      // 조회수
    private int likes;                      // 좋아요 수
    private int commentsCount;              // 댓글 수

    private LocalDateTime regDate;        // 생성일시
    private LocalDateTime editDate;        // 수정일시

    private List<String> tags;              // 태그 목록
    private List<CommunityFileDTO> attachments;       // 첨부파일 URL 리스트

    public static CommunityDTO from(Community entity, String domain) {
        return CommunityDTO.builder()
                .idx(entity.getIdx())
                .userId(entity.getUserId())
                .userName(entity.getUserName())
                .category(entity.getCategory())
                .title(entity.getTitle())
                .content(entity.getContent())
                .isAnonymous(entity.getIsAnonymous().name())
                .isEdited(entity.getIsEdited().name())
                .isUse(entity.getIsUse().name())
                .views(entity.getViews())
                .thumbnailUrl(entity.getThumbnailUrl() != null ? domain + entity.getThumbnailUrl() : null)
                .regDate(entity.getRegDate())
                .editDate(entity.getEditDate())
                .likes(entity.getLikes().size())
                .tags(entity.getTags().stream().map(CommunityTag::getName).toList())
                .attachments(
                        entity.getAttachments().stream()
                                .map(file -> CommunityFileDTO.builder()
                                        .idx(file.getIdx())
                                        .fileUrl(domain + file.getFileUrl()) // 도메인 붙이기
                                        .fileName(file.getFileName())
                                        .fileSize(file.getFileSize())
                                        .regDate(file.getRegDate())
                                        .editDate(file.getEditDate())
                                        .build()
                                )
                                .toList()
                )
                .commentsCount(entity.getCommentsCount())
//                .comments(entity.getComments().stream().map(CommunityComment::toDTO).toList()) // toDTO()는 각 엔티티에 구현 필요
                .build();
    }

}
