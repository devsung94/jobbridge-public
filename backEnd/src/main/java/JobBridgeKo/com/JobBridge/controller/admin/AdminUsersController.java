package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.service.MemberService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
@RequestMapping("/api/admin/users")
public class AdminUsersController {
    private final MemberService memberService;
    private final JwtUtil jwtUtil;

    // -----------------------------------------
    // 1. 사용자 목록 관리
    // -----------------------------------------

    @GetMapping
    public ResponseEntity<?> getMemberList(@RequestParam(defaultValue = "1") int page,
                                           @RequestParam(defaultValue = "10") int size,
                                           @RequestParam(required = false) String role,
                                           @RequestParam(required = false) String userId,
                                           @RequestParam(required = false) String name) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<MemberDTO> memberPage = memberService.searchMembers(role, userId, name, pageable);
        if (memberPage.isEmpty()) {
            return ResponseUtil.ok("N", "조회 된 목록이 없습니다.", null);
        }

        return ResponseUtil.ok("Y", "조회 성공", Map.of(
                "users", memberPage.getContent(),
                "totalPages", memberPage.getTotalPages(),
                "totalElements", memberPage.getTotalElements()
        ));
    }

    @GetMapping("/{idx}")
    public ResponseEntity<MemberDTO> getUserById(@PathVariable Long idx) {
        MemberDTO user = memberService.getUserById(idx);
        return user != null ? ResponseEntity.ok(user) : ResponseEntity.notFound().build();
    }

    @PostMapping("/update")
    public ResponseEntity<?> updateUser(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody Map<String, String> requestBody) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        String userId = jwtUtil.validateToken(token);
        boolean success = memberService.updateUser(userId, requestBody);
        return success ? ResponseEntity.ok("사용자 정보 수정 완료") : ResponseEntity.badRequest().body("수정 실패");
    }

    @DeleteMapping("/{idx}")
    public ResponseEntity<?> deleteSingleUser(@PathVariable Long idx) {
        boolean result = memberService.deleteUsersByAdmin(idx);
        return result ?
                ResponseUtil.ok("Y", "회원 삭제 완료", null) :
                ResponseUtil.ok("N", "회원 삭제 실패", null);
    }

    @PostMapping("/selectDelete")
    public ResponseEntity<?> selectDeleteUsers(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> userIdxs = requestBody.get("idxs");
        if (userIdxs == null || userIdxs.isEmpty()) {
            return ResponseEntity.badRequest().body("삭제할 사용자를 선택해주세요.");
        }
        boolean success = memberService.deleteMultipleUsersByAdmin(userIdxs);
        return success ?
                ResponseUtil.ok("Y", "선택 유저 삭제가 완료 되었습니다.", null) :
                ResponseUtil.ok("N", "선택 유저 삭제가 실패 되었습니다.", null);
    }

    @PostMapping("/forceDelete")
    public ResponseEntity<?> forceDeleteUsers(@RequestBody Map<String, List<Long>> requestBody) {
        List<Long> userIdxs = requestBody.get("idxs");
        if (userIdxs == null || userIdxs.isEmpty()) {
            return ResponseEntity.badRequest().body("완전 삭제할 사용자를 선택해주세요.");
        }
        boolean success = memberService.forceDeleteUsers(userIdxs);
        return success ? ResponseUtil.ok("Y", "선택한 유저를 완전 삭제했습니다.", null)
                : ResponseUtil.ok("N", "완전 삭제에 실패했습니다.", null);
    }

}
