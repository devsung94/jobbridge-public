package JobBridgeKo.com.JobBridge.controller.community;


import JobBridgeKo.com.JobBridge.controller.company.CompanyController;
import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityRequestDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyRequestDTO;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.service.CommunityService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.logging.ErrorManager;

@RestController
@RequestMapping("/api/user/community")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class UserCommunityController {

    private static final Logger logger = LoggerFactory.getLogger(UserCommunityController.class);

    private final CommunityService communityService;
    private final JwtUtil jwtUtil;

    // 내가 작성한 게시글 목록 (페이징)
    @GetMapping("/posts")
    public ResponseEntity<?> getMyPosts(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            Page<CommunityDTO> postList = communityService.findPostsByUser(userId, PageRequest.of(page - 1, size));
            return ResponseUtil.ok("Y", "작성한 게시글 조회 성공", Map.of(
                    "items", postList.getContent(),
                    "totalPages", postList.getTotalPages(),
                    "totalElements", postList.getTotalElements()
            ));
        } catch (Exception e) {
            logger.error("작성한 게시글 조회 실패", e);
            return ResponseUtil.ok("N", "조회 중 오류 발생: " + e.getMessage(), null);
        }
    }

    // 게시판 등록
    @PostMapping
    public ResponseEntity<?> submitCommunity(
            @CookieValue(value = "AccessToken", required = false) String token,
            @ModelAttribute CommunityRequestDTO communityRequestDTO // ⬅ MultipartFile을 받기 위해 @ModelAttribute 사용
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            communityRequestDTO.setUserId(userId); // userId 직접 주입
            communityService.saveCommunity(userId, communityRequestDTO);
            return ResponseUtil.ok("Y", "커뮤니티 등록에 성공적으로 등록되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 등록 중 오류 발생", e); // ← 여기로 교체
            return ResponseUtil.ok("N", "커뮤니티 등록 실패: " + e.getMessage(), null);
        }
    }

    // 게시판 수정
    @PutMapping("/{co_idx}")
    public ResponseEntity<?> updateCommunity(
            @PathVariable Long co_idx,
            @ModelAttribute CommunityRequestDTO communityRequestDTO,
            @CookieValue(value = "AccessToken", required = false) String token) throws IOException {

        System.out.println("communityRequestDTO : " + communityRequestDTO);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        boolean isAdmin = userId.equals("admin");
        communityService.updateCommunity(co_idx, communityRequestDTO, userId, isAdmin);
        return ResponseUtil.ok("Y", "커뮤니티 수정 완료", null);
    }


    // 커뮤니티 삭제
    @DeleteMapping("/{co_idx}")
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


}
