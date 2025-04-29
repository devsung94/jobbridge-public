package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.controller.resume.UserResumeController;
import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ResumeRequestDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ResumeResponseDTO;
import JobBridgeKo.com.JobBridge.service.ResumeService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/admin/resume")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class AdminResumeController {
    private static final Logger logger = LoggerFactory.getLogger(UserResumeController.class);

    private final JwtUtil jwtUtil;
    private final ResumeService resumeService;

    // 특정 이력서 idx로 조회 (모든 사용자 이력서 대상)
    @GetMapping("/{userId}")
    public ResponseEntity<?> getSelectResumeDetail(
            @PathVariable("userId") String userId
    ) {
        try {
            ResumeResponseDTO resume = resumeService.getResumeDetail(userId);
            return ResponseUtil.ok("Y", "이력서 정보 불러오기 성공", resume);
        } catch (Exception e) {
            logger.error("이력서 정보 불러오기 실패", e);
            return ResponseUtil.ok("N", "이력서 정보 불러오기 실패: " + e.getMessage(), null);
        }
    }

    @GetMapping("/detail/{resumeIdx}")
    public ResponseEntity<?> getResumeWithUserProfile(@PathVariable Long resumeIdx) {
        try {
            ResumeResponseDTO resume = resumeService.getResumeByIdx(resumeIdx);
            MemberDTO userProfile = resumeService.getUserProfileByResumeIdx(resumeIdx);

            return ResponseUtil.ok("Y", "조회 성공", Map.of(
                    "resume", resume,
                    "userProfile", userProfile
            ));
        } catch (Exception e) {
            return ResponseUtil.ok("N", "조회 실패: " + e.getMessage(), null);
        }
    }


    // 이력서 수정
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateResume(
            @PathVariable("userId") String userId,
            @RequestPart("resume") ResumeRequestDTO resumeDTO,
            @RequestPart(value = "photo", required = false) MultipartFile photo
    ) {

        try {
            resumeDTO.setUserId(userId);
            resumeDTO.setPhoto(photo);
            resumeService.updateResume(userId, resumeDTO, photo);
            return ResponseUtil.ok("Y", "이력서가 성공적으로 수정되었습니다.", null);
        } catch (Exception e) {
            logger.error("이력서 수정 중 오류 발생", e);
            return ResponseUtil.ok("N", "이력서 수정 실패: " + e.getMessage(), null);
        }
    }

}
