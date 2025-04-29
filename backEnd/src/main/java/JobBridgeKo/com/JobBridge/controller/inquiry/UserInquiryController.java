package JobBridgeKo.com.JobBridge.controller.inquiry;

import JobBridgeKo.com.JobBridge.controller.community.UserCommentController;
import JobBridgeKo.com.JobBridge.dto.InquiryDTO;
import JobBridgeKo.com.JobBridge.service.InquiryService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping("/api/user/inquiry")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class UserInquiryController {
    private static final Logger logger = LoggerFactory.getLogger(UserInquiryController.class);

    private final InquiryService inquiryService;
    private final JwtUtil jwtUtil;

    // 채용 공고 목록 조회 (페이징 적용)
    @GetMapping
    public ResponseEntity<?> getInquiryList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "5") int size,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            String userId = jwtUtil.validateToken(token);
            Pageable pageable = PageRequest.of(page - 1, size, Sort.by(Sort.Direction.DESC, "regDate"));
            Page<InquiryDTO> inquiryPage = inquiryService.getUserInquiriesWithAnswers(userId, pageable);

            if (inquiryPage.isEmpty()) {
                return ResponseUtil.ok("N","조회 된 목록이 없습니다.",null);
            }

            return ResponseUtil.ok("Y", "문의 목록 조회 성공", Map.of(
                    "contents", inquiryPage.getContent(),
                    "totalPages", inquiryPage.getTotalPages(),
                    "totalElements", inquiryPage.getTotalElements()));
        } catch (Exception e) {
            logger.error("문의내역 조회 실패", e);
            return ResponseUtil.ok("N", "문의내역 조회 실패: " + e.getMessage(), null);
        }
    }

    // 특정 채용 공고 조회 API (idx 사용)
    @GetMapping("/{idx}")
    public ResponseEntity<?> getInquiry(@PathVariable Long idx) {
        return inquiryService.getInquiryByIdx(idx)
                .map(inquiry -> ResponseUtil.ok("Y","조회 성공", inquiry))
                .orElse(ResponseUtil.ok("N","조회 된 목록이 없습니다.",null));
    }

    // 문의 등록
    @PostMapping
    public ResponseEntity<?> createInquiry(@RequestBody InquiryDTO inquiryDTO, @CookieValue(value = "AccessToken", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        Long CreateIdx = inquiryService.createInquiry(inquiryDTO,token);
        return ResponseUtil.ok("Y", "채용 공고 등록 완료", CreateIdx);
    }


    // 문의 수정
    @PutMapping("/{idx}")
    public ResponseEntity<?> updateInquiry(
            @PathVariable Long idx,
            @RequestBody InquiryDTO inquiryDTO,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        InquiryDTO updatedInquiry = inquiryService.updateInquiry(idx, inquiryDTO, token);
        return ResponseUtil.ok("Y", "채용 공고 수정 완료", updatedInquiry);
    }

    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteInquiry(
            @PathVariable Long idx,
            @CookieValue(value = "AccessToken", required = false) String token) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        Boolean updatedInquiry = inquiryService.deleteInquiry(idx, token);
        return ResponseUtil.ok("Y", "채용 공고 수정 완료", updatedInquiry);
    }
}
