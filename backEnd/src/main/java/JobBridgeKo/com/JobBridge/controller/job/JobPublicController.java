package JobBridgeKo.com.JobBridge.controller.job;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.service.JobService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class JobPublicController {

    private final JobService jobService;

    // 채용 공고 목록 조회
    @GetMapping
    public ResponseEntity<?> getJobList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String keyword) {

        Pageable pageable = PageRequest.of(page - 1, size);

        try {
            Page<JobDTO> jobPage = jobService.getAllJobs(city, keyword, pageable, UseStatus.Y);

            if (jobPage.isEmpty()) {
                return ResponseUtil.ok("N", "조회 된 목록이 없습니다.", null);
            }

            return ResponseUtil.ok("Y", "조회 성공", Map.of(
                    "jobs", jobPage.getContent(),
                    "totalPages", jobPage.getTotalPages()
            ));
        } catch (Exception e) {
            e.printStackTrace(); // 서버 로그에도 출력 (디버깅용)

            // 에러 종류별로 메시지 구분
            String errorMessage;
            if (e.getCause() != null) {
                errorMessage = e.getClass().getSimpleName() + " - " + e.getCause().getMessage();
            } else {
                errorMessage = e.getClass().getSimpleName() + " - " + e.getMessage();
            }

            return ResponseUtil.ok("N", "DB 오류 발생: " + errorMessage, null);
        }
    }



    // 특정 채용 공고 조회
    @GetMapping("/{idx}")
    public ResponseEntity<?> getJob(@PathVariable Long idx) {
        return jobService.getJobByIdx(idx)
                .map(job -> ResponseUtil.ok("Y","조회 성공", job))
                .orElse(ResponseUtil.ok("N","조회 된 목록이 없습니다.",null));
    }
}
