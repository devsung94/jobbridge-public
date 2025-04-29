package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.controller.company.CompanyController;
import JobBridgeKo.com.JobBridge.dto.company.CompanyRequestDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.service.CompanyService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/company")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class AdminCompanyController {
    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);

    private final JwtUtil jwtUtil;
    private final CompanyService companyService;

    // 내가 등록한 회사정보 상세조회
    @GetMapping("/{userId}")
    public ResponseEntity<?> getCompanyDetail(
            @PathVariable("userId") String userId
    ) {
        try {
            CompanyResponseDTO company = companyService.getCompanyDetail(userId);
            return ResponseUtil.ok("Y", "회사 정보 불러오기 성공", company);
        } catch (Exception e) {
            logger.error("회사 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "회사 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }


    // 회사정보 수정
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateCompany(
            @PathVariable("userId") String userId,
            @ModelAttribute CompanyRequestDTO companyDTO
    ) {
        System.out.println("companyDTO : "+companyDTO);
        try {
            companyDTO.setUserId(userId);
            companyService.updateCompany(userId, companyDTO);
            return ResponseUtil.ok("Y", "회사 정보가 성공적으로 수정되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 정보가 수정 중 오류 발생", e);
            return ResponseUtil.ok("N", "회사 정보가 수정 실패: " + e.getMessage(), null);
        }
    }
}
