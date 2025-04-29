package JobBridgeKo.com.JobBridge.controller.job;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.service.JobService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/com/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class CompanyJobController {

    private final JobService jobService;
    private final JwtUtil jwtUtil;

    // 내가 올린 채용 공고 조회
    @GetMapping("/mine")
    public ResponseEntity<?> getMyJobs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);
        Page<JobDTO> jobPage = jobService.getJobsByRecruiter(userId, PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate")));

        if (jobPage.isEmpty()) {
            return ResponseUtil.ok("N", "작성한 채용공고가 없습니다.", null);
        }

        return ResponseUtil.ok("Y", "조회 성공", Map.of(
                "myJobs", jobPage.getContent(),
                "totalPages", jobPage.getTotalPages(),
                "totalElements", jobPage.getTotalElements()
        ));
    }

    // 채용 공고 생성
    @PostMapping
    public ResponseEntity<?> createJob(@RequestBody JobDTO jobDTO,@CookieValue(value = "AccessToken", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);
        Long CreateIdx = jobService.createJob(jobDTO,userId);
        return ResponseUtil.ok("Y", "채용 공고 등록 완료", CreateIdx);
    }

    // 채용 공고 수정
    @PutMapping("/{idx}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long idx,
            @RequestBody JobDTO jobDTO,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        JobDTO updatedJob = jobService.updateJob(idx, jobDTO, userId);
        return ResponseUtil.ok("Y", "채용 공고 수정 완료", updatedJob);
    }


    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        jobService.deleteJob(idx, userId);

        return ResponseUtil.ok("Y", "공고가 삭제 처리되었습니다.", null);
    }

}
