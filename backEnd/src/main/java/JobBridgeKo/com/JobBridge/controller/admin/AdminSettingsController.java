package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.AdminSettingsDTO;
import JobBridgeKo.com.JobBridge.service.AdminSettingsService;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/settings")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
public class AdminSettingsController {

    private final AdminSettingsService service;

    @GetMapping
    public ResponseEntity<?> getSettings() {
        AdminSettingsDTO dto = service.getSettings();
        return ResponseUtil.ok("Y", "관리자 설정 목록 조회 완료", dto);
    }

    @PatchMapping
    public ResponseEntity<?> updateSettings(@RequestBody AdminSettingsDTO dto) {
        service.AdminUpdateSettings(dto);
        return ResponseUtil.ok("Y", "저장 완료",null);
    }
}

