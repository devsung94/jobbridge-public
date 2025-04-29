package JobBridgeKo.com.JobBridge.controller.community;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import JobBridgeKo.com.JobBridge.service.CommunityService;
import JobBridgeKo.com.JobBridge.service.JobService;
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
public class CommunityController {

    private final CommunityService communityService;

    // 게시판 목록 조회
    @GetMapping
    public ResponseEntity<?> getCommunityList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category
    ) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<CommunityDTO> communityPage = communityService.searchCommunity(keyword, category, pageable, CommunityStatus.IsUse.Y);

        if (communityPage.isEmpty()) {
            return ResponseUtil.ok("N","조회 된 목록이 없습니다.",null);
        }

        return ResponseUtil.ok("Y","조회 성공", Map.of(
                "communitys", communityPage.getContent(),
                "totalPages", communityPage.getTotalPages()
        ));
    }


    // 특정 게시판 조회
    @GetMapping("/{idx}")
    public ResponseEntity<?> getCommunityDetail(@PathVariable Long idx) {
        try {
            communityService.incrementViews(idx); // 조회수 증가
            CommunityDTO dto = communityService.getCommunityByIdx(idx)
                    .orElseThrow(() -> new RuntimeException("게시글 없음"));
            return ResponseUtil.ok("Y", "조회 성공", dto);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "조회 실패: " + e.getMessage(), null);
        }
    }

}
