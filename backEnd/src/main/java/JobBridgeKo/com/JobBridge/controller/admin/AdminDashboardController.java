package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.StatsResponseDTO;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.service.AdminStatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/dashboard")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class AdminDashboardController {
    private final AdminStatsService adminStatsService;

    @GetMapping("/stats")
    public ResponseEntity<StatsResponseDTO> getStats() {
        StatsResponseDTO response = adminStatsService.getWeeklySignupStats();
        return ResponseEntity.ok(response);
    }
}

