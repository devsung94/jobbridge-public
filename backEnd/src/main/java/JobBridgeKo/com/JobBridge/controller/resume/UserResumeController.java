package JobBridgeKo.com.JobBridge.controller.resume;

import JobBridgeKo.com.JobBridge.dto.resume.ResumeRequestDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ResumeResponseDTO;
import JobBridgeKo.com.JobBridge.service.ResumeService;
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
@RequestMapping("/api/user/resume")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class UserResumeController {
    private static final Logger logger = LoggerFactory.getLogger(UserResumeController.class);

    private final JwtUtil jwtUtil;
    private final ResumeService resumeService;

    // 이력서 등록 여부 조회
    @GetMapping("/status")
    public ResponseEntity<?> resume(@CookieValue(value = "AccessToken", required = false) String token, HttpServletResponse response) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        boolean hasResume = resumeService.checkResumeExists(userId);
        if(!hasResume){
            return ResponseUtil.ok("N","이력서가 없습니다.",null);
        }
        return ResponseUtil.ok("Y","이력서가 있습니다.",null);
    }

    // 이력서 등록
    @PostMapping("/submit")
    public ResponseEntity<?> submitResume(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestPart("resume") ResumeRequestDTO resumeRequestDTO, // ⬅ MultipartFile을 받기 위해 @ModelAttribute 사용
            @RequestPart(value = "photo", required = false) MultipartFile photo // 프로필 사진 따로 받기
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            resumeRequestDTO.setUserId(userId); // userId 직접 주입
            resumeRequestDTO.setPhoto(photo);   // photo 직접 주입
            resumeService.saveResume(userId, resumeRequestDTO);
            return ResponseUtil.ok("Y", "이력서가 성공적으로 등록되었습니다.", null);
        } catch (Exception e) {
            logger.error("이력서 저장 중 오류 발생", e); // ← 여기로 교체
            return ResponseUtil.ok("N", "이력서 등록 실패: " + e.getMessage(), null);
        }
    }

    // 내가 등록한 이력서 상세조회
    @GetMapping("/detail")
    public ResponseEntity<?> getResumeDetail(
            @CookieValue(value = "AccessToken", required = false) String token
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            ResumeResponseDTO resume = resumeService.getResumeDetail(userId);
            return ResponseUtil.ok("Y", "이력서 정보 불러오기 성공", resume);
        } catch (Exception e) {
            logger.error("이력서 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "이력서 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }

    // 이력서 수정
    @PutMapping("/update")
    public ResponseEntity<?> updateResume(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestPart("resume") ResumeRequestDTO resumeDTO,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            resumeDTO.setUserId(userId);
            resumeDTO.setPhoto(photo);
            resumeService.updateResume(userId, resumeDTO, photo);
            return ResponseUtil.ok("Y", "이력서가 성공적으로 수정되었습니다.", null);
        } catch (Exception e) {
            logger.error("이력서 수정 중 오류 발생", e);
            return ResponseUtil.ok("N", "이력서 수정 실패: " + e.getMessage(), null);
        }
    }

    // 특정 이력서 idx로 조회 (모든 사용자 이력서 대상)
    @GetMapping("/{idx}")
    public ResponseEntity<?> getSelectResumeDetail(
            @PathVariable("idx") Long idx
    ) {
        try {
            ResumeResponseDTO resume = resumeService.getResumeDetailByIdx(idx);
            return ResponseUtil.ok("Y", "이력서 정보 불러오기 성공", resume);
        } catch (Exception e) {
            logger.error("이력서 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "이력서 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }


}
