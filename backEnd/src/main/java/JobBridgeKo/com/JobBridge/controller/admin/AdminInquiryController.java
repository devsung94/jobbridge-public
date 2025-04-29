package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.InquiryDTO;
import JobBridgeKo.com.JobBridge.service.InquiryService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/inquiry")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
public class AdminInquiryController {

    private final InquiryService inquiryService;
    private final JwtUtil jwtUtil;

    // 관리자 - 전체 문의 목록 조회
    @GetMapping
    public ResponseEntity<?> getAdminInquiryList(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String name
    ) {
        PageRequest pageable = PageRequest.of(page - 1, size);
        Page<InquiryDTO> inquiryPage = inquiryService.getAllInquiriesWithAnswers(title, userId, name, pageable);

        if (inquiryPage.isEmpty()) {
            return ResponseUtil.ok("N", "조회된 문의가 없습니다.", null);
        }

        return ResponseUtil.ok("Y", "문의 목록 조회 성공",
                java.util.Map.of(
                        "contents", inquiryPage.getContent(),
                        "totalPages", inquiryPage.getTotalPages(),
                        "totalElements", inquiryPage.getTotalElements()
                ));
    }

    // 문의 수정(관리자 수정)
    @PutMapping("/{idx}")
    public ResponseEntity<?> updateInquiryByAdmin(@PathVariable Long idx, @RequestBody InquiryDTO dto) {
        boolean result = inquiryService.updateInquiryByAdmin(idx, dto);
        return result
                ? ResponseUtil.ok("Y", "문의 수정 성공", null)
                : ResponseUtil.ok("N", "문의 수정 실패", null);
    }

    // 문의 삭제(관리자 삭제)
    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteSingleInquiry(@PathVariable Long idx) {
        boolean result = inquiryService.deleteInquiryByAdmin(idx);
        return result ?
                ResponseUtil.ok("Y", "문의 삭제 완료", null) :
                ResponseUtil.ok("N", "문의 삭제 실패", null);
    }

    // 선택 문의 삭제(관리자 선택삭제)
    @PostMapping("/selectDelete")
    public ResponseEntity<?> deleteSelectedInquiries(@RequestBody Map<String, List<Long>> body) {
        List<Long> idxs = body.get("idxs"); // 프론트에서 보내는 키 이름과 일치해야 함
        boolean result = inquiryService.deleteMultipleInquiriesByAdmin(idxs);
        return result ?
                ResponseUtil.ok("Y", "선택 문의 삭제 완료", null) :
                ResponseUtil.ok("N", "선택 삭제 실패", null);
    }

    // 문의 답변 등록(관리자 등록)
    @PostMapping("/answer")
    public ResponseEntity<?> writeAnswer(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody InquiryDTO dto) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);
        boolean result = inquiryService.answerToInquiry(userId, dto);
        return result ?
                ResponseUtil.ok("Y", "답변 등록 성공", null) :
                ResponseUtil.ok("N", "답변 등록 실패", null);
    }

    // 문의 답변 수정(관리자 수정)
    @PutMapping("/answer/{idx}")
    public ResponseEntity<?> updateAnswer(@PathVariable Long idx, @RequestBody InquiryDTO dto) {
        boolean result = inquiryService.updateAnswer(idx, dto);
        return result ?
                ResponseUtil.ok("Y", "답변 수정 성공", null) :
                ResponseUtil.ok("N", "답변 수정 실패", null);
    }

    @PostMapping("/forceDelete")
    public ResponseEntity<?> forceDeleteInquiries(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> idxs = requestBody.get("idxs");
        if (idxs == null || idxs.isEmpty()) {
            return ResponseEntity.badRequest().body("완전 삭제할 문의를 선택해주세요.");
        }
        boolean success = inquiryService.forceDeleteInquiries(idxs);
        return success ? ResponseUtil.ok("Y", "선택한 문의를 완전 삭제했습니다.", null)
                : ResponseUtil.ok("N", "완전 삭제에 실패했습니다.", null);
    }

}
