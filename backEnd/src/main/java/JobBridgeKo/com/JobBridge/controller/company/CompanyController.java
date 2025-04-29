package JobBridgeKo.com.JobBridge.controller.company;

import JobBridgeKo.com.JobBridge.dto.company.CompanyRequestDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.service.CompanyService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/com/company")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class CompanyController {

    private static final Logger logger = LoggerFactory.getLogger(CompanyController.class);

    private final JwtUtil jwtUtil;
    private final CompanyService companyService;

    // 내가 등록한 회사정보 상세조회
    @GetMapping
    public ResponseEntity<?> getCompanyDetail(
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            CompanyResponseDTO company = companyService.getCompanyDetail(userId);
            return ResponseUtil.ok("Y", "회사 정보 불러오기 성공", company);
        } catch (Exception e) {
            logger.error("회사 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "회사 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }

    // 특정 회사 정보 idx로 조회 (모든 사용자 회사 대상)
    @GetMapping("/{idx}")
    public ResponseEntity<?> getSelectCompanyDetail(
            @PathVariable("idx") Long idx
    ) {
        try {
            CompanyResponseDTO company = companyService.getCompanyDetailByIdx(idx);
            return ResponseUtil.ok("Y", "회사 정보 불러오기 성공", company);
        } catch (Exception e) {
            logger.error("회사 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "회사 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }

    // 회사정보 등록
    @PostMapping
    public ResponseEntity<?> submitCompany(
            @CookieValue(value = "AccessToken", required = false) String token,
            @ModelAttribute CompanyRequestDTO companyRequestDTO, // ⬅ MultipartFile을 받기 위해 @ModelAttribute 사용
            @RequestPart(value = "logo", required = false) MultipartFile logo // 프로필 사진 따로 받기
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            companyRequestDTO.setUserId(userId); // userId 직접 주입
            companyRequestDTO.setLogo(logo);   // photo 직접 주입
            companyService.saveCompany(userId, companyRequestDTO);
            return ResponseUtil.ok("Y", "회사 등록에 성공적으로 등록되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 등록 중 오류 발생", e); // ← 여기로 교체
            return ResponseUtil.ok("N", "회사 등록 실패: " + e.getMessage(), null);
        }
    }

    // 회사정보 수정
    @PutMapping
    public ResponseEntity<?> updateCompany(
            @CookieValue(value = "AccessToken", required = false) String token,
            @ModelAttribute CompanyRequestDTO companyDTO
    ) {
        System.out.println("companyDTO : "+companyDTO);
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            companyDTO.setUserId(userId);
            companyService.updateCompany(userId, companyDTO);
            return ResponseUtil.ok("Y", "회사 정보가 성공적으로 수정되었습니다.", null);
        } catch (Exception e) {
            logger.error("회사 정보가 수정 중 오류 발생", e);
            return ResponseUtil.ok("N", "회사 정보가 수정 실패: " + e.getMessage(), null);
        }
    }

    // 회사정보 등록 여부 조회
    @GetMapping("/status")
    public ResponseEntity<?> companyStatus(@CookieValue(value = "AccessToken", required = false) String token, HttpServletResponse response) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        boolean hasCompany = companyService.checkCompanyExists(userId);
        if(!hasCompany){
            return ResponseUtil.ok("N","회사 정보가 없습니다.",null);
        }
        return ResponseUtil.ok("Y","회사 정보가 있습니다.",null);
    }

}
