package JobBridgeKo.com.JobBridge.entity.community;

import JobBridgeKo.com.JobBridge.dto.community.CommentDTO;
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
@Table(name = "community_comment")
public class CommunityComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cm_idx")
    private Long idx;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "co_idx")
    private Community community;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private CommunityComment parent; // null이면 일반 댓글, not null이면 대댓글

    @Column(name = "cm_mb_id", length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    @Column(name = "cm_mb_name")
    private String userName;

    @Column(name = "cm_content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "cm_is_use", columnDefinition = "ENUM('Y','N') DEFAULT 'Y'")
    private CommunityStatus.IsUse isUse;       // 삭제 여부

    @Column(name = "cm_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Column(name = "cm_edit_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    @Builder.Default
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL)
    private List<CommunityComment> replies = new ArrayList<>();

    public static CommentDTO toDTO(CommunityComment comment) {
        return CommentDTO.builder()
                .idx(comment.getIdx())
                .userId(comment.getUserId())
                .userName(comment.getUserName())
                .content(comment.getContent())
                .isUse(comment.getIsUse())
                .regDate(comment.getRegDate())
                .parentId(comment.getParent() != null ? comment.getParent().getIdx() : null)
                .build();
    }


}

