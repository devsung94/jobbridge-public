package JobBridgeKo.com.JobBridge.entity.community;

import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(
    name = "community",
    indexes = {
            @Index(name = "idx_community_is_use", columnList = "co_is_use"),
            @Index(name = "idx_community_category", columnList = "co_category")
    }
)
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "co_idx")
    private Long idx;               // 게시글 IDX

    @Column(name = "co_mb_id", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;          // 작성자 ID

    @Column(name = "co_mb_name")
    private String userName;        // 작성자명

    @Column(name = "co_category")
    private String category;        // 카테고리 (예: 자유, Q&A, 후기 등)

    @Column(name = "co_title")
    private String title;           // 제목

    @Column(name = "co_content",columnDefinition = "TEXT")
    private String content;         // 내용

    @Enumerated(EnumType.STRING)

    @Column(name = "co_is_anonymous", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private CommunityStatus.IsAnonymous isAnonymous;    // 익명 여부

    @Enumerated(EnumType.STRING)
    @Column(name = "co_is_edit", columnDefinition = "ENUM('Y','N') DEFAULT 'N'")
    private CommunityStatus.IsEditStatus isEdited;       // 수정 여부

    @Enumerated(EnumType.STRING)
    @Column(name = "co_is_use", columnDefinition = "ENUM('Y','N') DEFAULT 'Y'")
    private CommunityStatus.IsUse isUse;       // 삭제 여부
    
    @Column(name = "co_thumb")
    private String thumbnailUrl;

    @Column(name = "co_views", columnDefinition = "INT DEFAULT 0")
    private int views;                      // 조회수

    @Column(name = "co_comment_count", columnDefinition = "INT DEFAULT 0")
    private int commentsCount;              // 댓글 수량

    @Column(name = "co_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;   // 생성일

    @Column(name = "co_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;  // 수정일

    @Builder.Default
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityTag> tags = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityFile> attachments = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityLike> likes = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "community", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CommunityComment> comments = new ArrayList<>();

}
