package JobBridgeKo.com.JobBridge.controller.community;

import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import JobBridgeKo.com.JobBridge.dto.community.CommentDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.community.CommunityComment;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.service.CommunityCommentService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user/community")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class UserCommentController {

    private static final Logger logger = LoggerFactory.getLogger(UserCommentController.class);

    private final CommunityCommentService communityCommentService;
    private final JwtUtil jwtUtil;

    // 내가 댓글 단 게시글 목록 (페이징)
    @GetMapping("/comments")
    public ResponseEntity<?> getCommentedPosts(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            Page<CommunityDTO> commentPosts = communityCommentService.findCommentedPostDTOsByUser(userId, PageRequest.of(page - 1, size));
            return ResponseUtil.ok("Y", "댓글 단 게시글 목록 조회 성공", Map.of(
                    "items", commentPosts.getContent(),
                    "totalPages", commentPosts.getTotalPages(),
                    "totalElements", commentPosts.getTotalElements()
            ));
        } catch (Exception e) {
            logger.error("댓글 단 게시글 조회 실패", e);
            return ResponseUtil.ok("N", "조회 중 오류 발생: " + e.getMessage(), null);
        }
    }

    @GetMapping("/{communityIdx}/comments/find-page")
    public ResponseEntity<?> findCommentPage(
            @PathVariable Long communityIdx,
            @RequestParam Long commentIdx,
            @RequestParam(defaultValue = "5") int size
    ) {
        try {
            int page = communityCommentService.findPageOfComment(communityIdx, commentIdx, size);
            return ResponseUtil.ok("Y", "댓글 페이지 조회 성공", Map.of("page", page));
        } catch (Exception e) {
            logger.error("댓글 페이지 조회 실패", e);
            return ResponseUtil.ok("N", "조회 중 오류 발생: " + e.getMessage(), null);
        }
    }


    // 게시판 댓글 등록
    @PostMapping("/{commentIdx}/comment")
    public ResponseEntity<?> submitComment(
            @PathVariable Long commentIdx,
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody CommentDTO commentDTO
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            System.out.println("commentDTO : "+commentDTO);
            String userId = jwtUtil.validateToken(token);
            commentDTO.setUserId(userId); // userId 직접 주입
            commentDTO.setCommunityIdx(commentIdx); // userId 직접 주입
            CommentDTO data = communityCommentService.saveComment(userId, commentDTO);
            return ResponseUtil.ok("Y", "댓글 등록에 성공적으로 등록되었습니다.", data);
        } catch (Exception e) {
            logger.error("댓글 등록 중 오류 발생", e); // ← 여기로 교체
            return ResponseUtil.ok("N", "댓글 등록 실패: " + e.getMessage(), null);
        }
    }

    // 댓글 수정
    @PutMapping("/comment/{commentIdx}")
    public ResponseEntity<?> editComment(
            @PathVariable Long commentIdx,
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody CommentDTO commentDTO
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            CommentDTO updated = communityCommentService.updateComment(commentIdx, userId, commentDTO.getContent());
            return ResponseUtil.ok("Y", "댓글 수정 성공", updated);
        } catch (Exception e) {
            logger.error("댓글 수정 실패", e);
            return ResponseUtil.ok("N", "댓글 수정 실패: " + e.getMessage(), null);
        }
    }

    // 댓글 삭제
    @DeleteMapping("/comment/{commentIdx}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long commentIdx,
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            boolean isAdmin = userId.equals("admin");
            communityCommentService.deleteCommentByUser(commentIdx, userId, isAdmin); // 본인 확인 포함
            return ResponseUtil.ok("Y", "댓글 삭제 성공", null);
        } catch (Exception e) {
            logger.error("댓글 삭제 실패", e);
            return ResponseUtil.ok("N", "댓글 삭제 실패: " + e.getMessage(), null);
        }
    }
}
