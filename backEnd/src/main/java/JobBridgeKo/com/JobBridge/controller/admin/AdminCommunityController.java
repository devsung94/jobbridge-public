package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityRequestDTO;
import JobBridgeKo.com.JobBridge.service.CommunityService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
@RequestMapping("/api/admin/community")
public class AdminCommunityController {

    private final JwtUtil jwtUtil;
    private final CommunityService communityService;
    // -----------------------------------------
    // 3. 커뮤니티 목록 관리
    // -----------------------------------------

    @GetMapping
    public ResponseEntity<?> getCommunityList(@RequestParam(defaultValue = "1") int page,
                                              @RequestParam(defaultValue = "10") int size,
                                              @RequestParam(required = false) String category,
                                              @RequestParam(required = false) String title,
                                              @RequestParam(required = false) String userId,
                                              @RequestParam(required = false) String name) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<CommunityDTO> communityPage = communityService.searchAdminCommunity(category, title, userId, name, pageable, null);

        if (communityPage.isEmpty()) return ResponseUtil.ok("N", "커뮤니티 글이 없습니다.", null);

        return ResponseUtil.ok("Y", "조회 성공", Map.of(
                "communitys", communityPage.getContent(),
                "totalPages", communityPage.getTotalPages(),
                "totalElements", communityPage.getTotalElements()
        ));
    }

    @PutMapping("/{co_idx}")
    public ResponseEntity<?> updateCommunityAsAdmin(
            @PathVariable("co_idx") Long idx,
            @ModelAttribute CommunityRequestDTO dto,
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            communityService.updateCommunity(idx, dto, userId, true);
            return ResponseUtil.ok("Y", "커뮤니티 수정 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "수정 실패: " + e.getMessage(), null);
        }
    }

    @PostMapping("/{co_idx}")
    public ResponseEntity<?> deleteCommunity(
            @PathVariable Long co_idx,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            boolean isAdmin = userId.equals("admin");
            communityService.deleteCommunity(co_idx, userId, isAdmin); // 관리자 여부 전달
            return ResponseUtil.ok("Y", "커뮤니티 게시글 삭제 완료", null);
        } catch (SecurityException se) {
            return ResponseUtil.ok("N", "작성자만 삭제할 수 있습니다.", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "삭제 중 오류 발생: " + e.getMessage(), null);
        }
    }

    @PostMapping("/selectDelete")
    public ResponseEntity<?> deleteCommunityPosts(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> postIdxList = requestBody.get("idxs");
        if (postIdxList == null || postIdxList.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 게시글을 선택해주세요.");
        }
        boolean success = communityService.deleteCommunityPostsByIds(postIdxList);
        return success ? ResponseUtil.ok("Y", "선택한 게시글 삭제에 성공 했습니다.", null)
                : ResponseUtil.ok("N", "선택한 게시글 삭제에 실패하였습니다.", null);
    }

    @PostMapping("/forceDelete")
    public ResponseEntity<?> forceDeleteCommunityPosts(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> postIdxList = requestBody.get("idxs");
        if (postIdxList == null || postIdxList.isEmpty()) {
            return ResponseEntity.badRequest().body("완전 삭제할 게시글을 선택해주세요.");
        }
        boolean success = communityService.forceDeleteCommunityPosts(postIdxList);
        return success ? ResponseUtil.ok("Y", "선택한 게시글을 완전 삭제했습니다.", null)
                : ResponseUtil.ok("N", "완전 삭제에 실패했습니다.", null);
    }
}
