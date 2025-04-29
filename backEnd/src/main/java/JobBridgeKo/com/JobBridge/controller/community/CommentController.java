package JobBridgeKo.com.JobBridge.controller.community;

import JobBridgeKo.com.JobBridge.dto.community.CommentDTO;
import JobBridgeKo.com.JobBridge.service.CommunityCommentService;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/community")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class CommentController {
    private final CommunityCommentService communityCommentService;

    @GetMapping("/{co_idx}/comments")
    public ResponseEntity<?> getComments(
            @PathVariable Long co_idx,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        Page<CommentDTO> commentPage = communityCommentService.getComments(co_idx, PageRequest.of(page - 1, size));
        return ResponseUtil.ok("Y", "댓글 조회 성공", Map.of(
                "comments", commentPage.getContent(),
                "totalPages", commentPage.getTotalPages(),
                "currentPage", page
        ));
    }
}
