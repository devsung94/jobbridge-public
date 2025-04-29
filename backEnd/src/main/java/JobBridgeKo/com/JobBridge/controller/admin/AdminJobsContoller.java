package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ApplicationResumeDTO;
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
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
@RequestMapping("/api/admin/jobs")
public class AdminJobsContoller {
    private final JwtUtil jwtUtil;
    private final JobService jobService;


    // -----------------------------------------
    // 2. 채용공고 목록 관리
    // -----------------------------------------

    @GetMapping
    public ResponseEntity<?> getJobList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String companyName,
            @RequestParam(required = false) String title) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<JobDTO> jobPage = jobService.getAllJobsWithApplicants(companyName, title, pageable);

        if (jobPage.isEmpty()) return ResponseUtil.ok("N", "채용공고가 없습니다.", null);

        return ResponseUtil.ok("Y", "조회 성공", Map.of(
                "jobs", jobPage.getContent(),
                "totalPages", jobPage.getTotalPages(),
                "totalElements", jobPage.getTotalElements()
        ));
    }

    // 지원자 목록 조회
    @GetMapping("/{jobIdx}/applications")
    public ResponseEntity<?> getApplicantsByJob(
            @PathVariable Long jobIdx,
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate"));
            Page<ApplicationResumeDTO> applications = jobService.getJobApplicationResumes(jobIdx, null, true, pageable);

            return ResponseUtil.ok("Y", "지원자 목록 조회 성공", Map.of(
                    "applicants",applications.getContent(),
                    "totalPages",applications.getTotalPages(),
                    "totalElements", applications.getTotalElements()));
        } catch (Exception e) {
            return ResponseUtil.ok("N", "지원자 목록 조회 실패: " + e.getMessage(), null);
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
            ApplicationResumeDTO applications = jobService.getApplicationResume(idx, userId, true);
            return ResponseUtil.ok("Y", "지원자 조회 성공", applications);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "지원자 조회 실패", null);
        }
    }

    @PatchMapping("/applications/status/{applicationIdx}")
    public ResponseEntity<?> updateApplicationStatus(
            @PathVariable Long applicationIdx,
            @RequestBody Map<String, String> request,
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String isStatus = request.get("isStatus");
            jobService.updateApplicationStatus(applicationIdx, isStatus);
            return ResponseUtil.ok("Y", "지원자 상태 변경 성공", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "지원자 상태 변경 실패", null);
        }

    }

    //-----------------------------------------------------------------------------------------------------

    @GetMapping("/{jobIdx}/company")
    public ResponseEntity<?> getCompanyByJob(@PathVariable Long jobIdx) {
        try {
            CompanyResponseDTO company = jobService.getCompanyInfoByJobIdx(jobIdx);
            return ResponseUtil.ok("Y", "회사 정보 조회 성공", company);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "회사 정보 조회 실패: " + e.getMessage(), null);
        }
    }

    @PutMapping("/{jobIdx}")
    public ResponseEntity<?> updateJobAsAdmin(
            @PathVariable Long jobIdx,
            @RequestBody JobDTO jobDTO
    ) {
        try {
            jobService.updateJobByAdmin(jobIdx, jobDTO); // 관리자는 userId 검사 없음
            return ResponseUtil.ok("Y", "채용공고 수정 완료", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "채용공고 수정 실패: " + e.getMessage(), null);
        }
    }

    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteSingleJobs(@PathVariable Long idx) {
        boolean result = jobService.deleteJobByAdmin(idx);
        return result ?
                ResponseUtil.ok("Y", "채용공고 삭제 완료", null) :
                ResponseUtil.ok("N", "채용공고 삭제 실패", null);
    }

    @PostMapping("/selectDelete")
    public ResponseEntity<?> deleteJobs(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> jobIdxList = requestBody.get("idxs");
        if (jobIdxList == null || jobIdxList.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 공고를 선택해주세요.");
        }
        boolean success = jobService.deleteJobsByIds(jobIdxList);
        return success ? ResponseUtil.ok("Y", "선택한 채용 공고 삭제에 성공 했습니다.", null)
                : ResponseUtil.ok("N", "선택한 채용 공고 삭제에 실패하였습니다.", null);
    }

    // AdminJobsController.java (추가)
    @PostMapping("/forceDelete")
    public ResponseEntity<?> forceDeleteJobs(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> jobIdxList = requestBody.get("idxs");
        if (jobIdxList == null || jobIdxList.isEmpty()) {
            return ResponseEntity.badRequest().body("완전 삭제할 공고를 선택해주세요.");
        }
        boolean success = jobService.forceDeleteJobsByIds(jobIdxList);
        return success ? ResponseUtil.ok("Y", "선택한 채용공고를 완전 삭제했습니다.", null)
                : ResponseUtil.ok("N", "완전 삭제에 실패했습니다.", null);
    }


}
