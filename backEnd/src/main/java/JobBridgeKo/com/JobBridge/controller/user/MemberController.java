package JobBridgeKo.com.JobBridge.controller.user;

import JobBridgeKo.com.JobBridge.service.MemberService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping("/api/user")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class MemberController {

    private final JwtUtil jwtUtil;
    private final MemberService memberService;
    @Value("app.front.origin_domain")
    private String domain;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getUser(@PathVariable String userId) {
        return memberService.getUserByUserId(userId)
                .map(user -> ResponseUtil.ok("Y","유저 조회가 완료되었습니다.",user))
                .orElse(ResponseUtil.ok("N","등록된 아이디가 없습니다.",null));
    }


    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @CookieValue(value = "AccessToken", required = false) String token,
            @RequestBody Map<String, String> requestBody) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        boolean updateResult = memberService.updateUser(userId, requestBody);

        if (updateResult) {
            return ResponseUtil.ok("Y", "회원 정보가 성공적으로 수정되었습니다.", null);
        } else {
            return ResponseUtil.ok("N", "회원 정보 수정 실패: 회원이 존재하지 않습니다.", null);
        }
    }

    @DeleteMapping("/withdraw")
    public ResponseEntity<?> deleteUser(@CookieValue(value = "AccessToken", required = false) String token,
                                        @CookieValue(value = "RefreshToken", required = false) String refreshToken,
                                        HttpServletResponse response) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        String userId = jwtUtil.validateToken(token);
        boolean deleteResult = memberService.updateUserStatusToWithdrawn(userId);

        if (deleteResult) {
            // DB에서 RefreshToken 삭제
            memberService.deleteRefreshToken(userId);

            // 쿠키 삭제 - Secure, SameSite 포함
            for (String cookieName : List.of("AccessToken", "RefreshToken")) {
                Cookie cookie = new Cookie(cookieName, null);
                cookie.setHttpOnly(true);
                cookie.setSecure(true); // ✅ 배포 환경에서는 true
                cookie.setPath("/");
                cookie.setMaxAge(0); // 삭제

                // SameSite=None 설정 (크로스도메인 대응)
                cookie.setAttribute("SameSite", "None");

                // 필요 시 도메인 명시 (예: .jobbridge.site)
//                cookie.setDomain(domain);

                response.addCookie(cookie);
            }

            return ResponseUtil.ok("Y", "회원 탈퇴가 완료되었습니다.", null);
        } else {
            return ResponseUtil.ok("N", "회원 탈퇴 실패: 회원이 존재하지 않습니다.", null);
        }
    }



}
