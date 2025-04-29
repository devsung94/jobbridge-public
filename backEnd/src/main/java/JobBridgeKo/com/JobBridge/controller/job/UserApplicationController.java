package JobBridgeKo.com.JobBridge.controller.job;

import JobBridgeKo.com.JobBridge.dto.JobApplicationDTO;
import JobBridgeKo.com.JobBridge.entity.JobApplication;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.service.JobApplicationService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping("/api/user/applications")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class UserApplicationController {
    private final JobApplicationService jobApplicationService;
    private final JwtUtil jwtUtil;


    // 내가 지원한 공고
    @GetMapping("/myApplications")
    public ResponseEntity<?> getMyApplications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @CookieValue(value = "AccessToken", required = false
            ) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate"));
        Page<JobApplicationDTO> applications = jobApplicationService.getMyApplications(userId,pageable);

        long validApplicantsCount = applications.getContent().stream()
                .filter(app -> UseStatus.Y.equals(app.getIsUse()))
                .filter(app -> app.getIsStatus() != JobApplicationStatus.C)
                .count();

        if (applications.isEmpty()) {
            return ResponseUtil.ok("N", "조회 된 목록이 없습니다.", null);
        }

        return ResponseUtil.ok("Y", "내 지원 목록 조회 성공", Map.of(
                "applications", applications.getContent(),
                "totalPages", applications.getTotalPages(),
                "totalElements", applications.getTotalElements(),
                "validApplications", validApplicantsCount
        ));
    }


    // 특정 채용 공고 지원하기
    @PostMapping("/apply/{jobIdx}")
    public ResponseEntity<?> applicationJob(
            @PathVariable Long jobIdx,
            @CookieValue(value = "AccessToken", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);

        try {
            boolean result = jobApplicationService.applicationForJob(jobIdx, userId);
            if (result) {
                return ResponseUtil.ok("Y", "채용 지원이 완료되었습니다.", null);
            } else {
                return ResponseUtil.ok("N", "지원할 수 없습니다.", null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.ok("N", e.getMessage() != null ? e.getMessage() : e.toString(), null);
        }
    }


    @GetMapping("/applied/{jobIdx}")
    public ResponseEntity<?> checkIfAppliedDetail(
            @PathVariable Long jobIdx,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        JobApplication app = jobApplicationService.checkAppliedStatus(jobIdx, userId);

        if (app == null) {
            return ResponseUtil.ok("Y", "지원 이력 없음", null);
        }

        return ResponseUtil.ok("Y", "지원 상태 조회 완료", Map.of(
                "isUse", app.getIsUse(),
                "isRead", app.getIsRead(),
                "isStatus", app.getIsStatus()
        ));
    }


    // 지원 취소
    @PostMapping("/cancel/{jobIdx}")
    public ResponseEntity<?> cancelJobApplication(
            @PathVariable Long jobIdx,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);
        if (!jobApplicationService.isUserApplicant(jobIdx, userId)) {
            return ResponseUtil.ok("N","이미 열람되었거나 면접제의/불합격 처리된 지원은 취소할 수 없습니다.",null);
        }

        boolean canceled = jobApplicationService.cancelJobApplication(jobIdx, userId);
        return canceled
                ? ResponseUtil.ok("Y","채용 지원이 취소되었습니다.",null)
                : ResponseUtil.badRequest("지원 취소 실패");
    }
}
