package JobBridgeKo.com.JobBridge.controller.search;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.service.ResumeService;
import JobBridgeKo.com.JobBridge.service.SearchService;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class SearchController {
    private final SearchService searchService;

    @GetMapping("/jobs")
    public ResponseEntity<Page<JobDTO>> searchJobs(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "startDate"));
        return ResponseEntity.ok(searchService.searchJobs(query, pageable));
    }

    @GetMapping("/community")
    public ResponseEntity<Page<CommunityDTO>> searchCommunity(
            @RequestParam String query,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate"));
        return ResponseEntity.ok(searchService.searchCommunity(query, pageable));
    }

}
