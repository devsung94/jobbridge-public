package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.AdminVisitorDTO;
import JobBridgeKo.com.JobBridge.service.AdminVisitorService;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/visitors")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class AdminVisitorController {

    private final AdminVisitorService visitorAdminService;


    // 방문자 목록 조회
    @GetMapping
    public ResponseEntity<?> getVisitors(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String ipAddress,
            @RequestParam(required = false) String path
    ) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<AdminVisitorDTO> visitorPage = visitorAdminService.getVisitors(pageable, ipAddress, path);

        if (visitorPage.isEmpty()) {
            return ResponseUtil.ok("N", "방문자 기록이 없습니다.", null);
        }

        return ResponseUtil.ok("Y", "조회 성공", Map.of(
                "visitors", visitorPage.getContent(),
                "totalPages", visitorPage.getTotalPages(),
                "totalElements", visitorPage.getTotalElements()
        ));
    }

    // 방문자 단건 삭제
    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteVisitor(@PathVariable Long idx) {
        try {
            visitorAdminService.deleteVisitor(idx);
            return ResponseUtil.ok("Y", "방문자 삭제 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "방문자 삭제 실패: " + e.getMessage(), null);
        }
    }

    // 방문자 다중 삭제
    @PostMapping("/selectDelete")
    public ResponseEntity<?> deleteSelectedVisitors(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> idxs = requestBody.get("idxs");
        if (idxs == null || idxs.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 방문자를 선택해주세요.");
        }

        try {
            visitorAdminService.deleteVisitors(idxs);
            return ResponseUtil.ok("Y", "선택한 방문자 삭제 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "선택 삭제 실패: " + e.getMessage(), null);
        }
    }


    @PostMapping("/forceDelete")
    public ResponseEntity<?> forceDeleteVisitorPosts(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> postIdxList = requestBody.get("idxs");
        if (postIdxList == null || postIdxList.isEmpty()) {
            return ResponseEntity.badRequest().body("완전 삭제할 방문 기록을 선택해주세요.");
        }
        boolean success = visitorAdminService.forceDeleteVisitorPosts(postIdxList);
        return success ? ResponseUtil.ok("Y", "선택한 방문 기록은 완전 삭제했습니다.", null)
                : ResponseUtil.ok("N", "완전 삭제에 실패했습니다.", null);
    }
}
