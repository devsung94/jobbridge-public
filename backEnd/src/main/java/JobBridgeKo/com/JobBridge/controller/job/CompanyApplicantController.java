package JobBridgeKo.com.JobBridge.controller.job;

import JobBridgeKo.com.JobBridge.dto.resume.ApplicationResumeDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ResumeResponseDTO;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.service.JobApplicationService;
import JobBridgeKo.com.JobBridge.service.JobService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping("/api/com/jobs")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class CompanyApplicantController {
    private final JobService jobService;
    private final JobApplicationService jobApplicationService;
    private final JwtUtil jwtUtil;

    // 지원자 목록 조회
    @GetMapping("/{idx}/applications")
    public ResponseEntity<?> getApplicantsForJob(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate"));
            Page<ApplicationResumeDTO> applications = jobService.getJobApplicationResumes(idx, userId, false, pageable);

            long validApplicantsCount = applications.getContent().stream()
                    .filter(app -> UseStatus.Y.equals(app.getIsUse()))
                    .filter(app -> app.getIsStatus() != JobApplicationStatus.C)
                    .filter(app -> app.getIsStatus() != JobApplicationStatus.N)
                    .count();

            return ResponseUtil.ok("Y", "지원자 목록 조회 성공", Map.of(
                    "applicants", applications.getContent(),
                    "totalPages", applications.getTotalPages(),
                    "totalElements", applications.getTotalElements(),
                    "validApplicants", validApplicantsCount // ✅ 프론트에서 이 값 사용
            ));
        } catch (SecurityException e) {
            return ResponseUtil.ok("N", "해당 공고의 작성자가 아닙니다.", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "지원자 목록 조회 실패", null);
        }
    }

    // 지원자 조회
    @GetMapping("/applications/{idx}")
    public ResponseEntity<?> getApplicantResume(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            ApplicationResumeDTO applications = jobService.getApplicationResume(idx, userId, false);
            return ResponseUtil.ok("Y", "지원자 조회 성공", applications);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "지원자 조회 실패", null);
        }
    }

    // 이력서 열람 체크
    @PostMapping("/applications/read/{idx}")
    public ResponseEntity<?> setApplicantRead(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            jobApplicationService.markAsRead(idx,userId);
            return ResponseUtil.ok("Y", "이력서 열람처리 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "이력서 열람처리 실패", null);
        }
    }


    // 지원자 상태 변경
    @PostMapping("/applications/status/{idx}")
    public ResponseEntity<?> setApplicantStatus(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody Map<String, String> body
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            String status = body.get("isStatus");
            jobApplicationService.markAsStatus(idx,userId,status);
            return ResponseUtil.ok("Y", "이력서 열람처리 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "이력서 열람처리 실패", null);
        }
    }

}
