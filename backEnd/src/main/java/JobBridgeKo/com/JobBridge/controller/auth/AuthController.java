package JobBridgeKo.com.JobBridge.controller.auth;

import JobBridgeKo.com.JobBridge.dto.*;
import JobBridgeKo.com.JobBridge.service.AdminSettingsService;
import JobBridgeKo.com.JobBridge.service.AuthService;
import JobBridgeKo.com.JobBridge.service.MemberService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping("/api/auth")
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class AuthController {

    private final JwtUtil jwtUtil;
    private final MemberService memberService;
    private final AuthService authService;
    private final AdminSettingsService adminSettingsService;

    @Value("${app.front.origin_domain}")
    private String domain;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody MemberRegisterRequestDTO dto) {
        if (adminSettingsService.isMaintenanceMode()) {
            return ResponseUtil.ok("N", "현재 점검 중입니다. 회원가입할 수 없습니다.", null);
        }


        Map<String, String> registerResult = memberService.registerUser(dto);
        return ResponseUtil.ok(registerResult.get("result"), registerResult.get("message"), null);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> credentials,
                                   HttpServletRequest request,
                                   HttpServletResponse response) {

        if (adminSettingsService.isMaintenanceMode()) {
            String userId = credentials.get("userId");

            // 유저의 Role 확인
            String role = memberService.getUserRole(userId);
            if (!role.equals("admin")) {
                return ResponseUtil.ok("N", "현재 점검 중입니다. 관리자만 로그인할 수 있습니다.", null);
            }
        }

        String userId = credentials.get("userId");
        String password = credentials.get("password");

        Map<String, String> loginResult = memberService.loginUser(userId, password, jwtUtil);
        if (loginResult.get("result").equals("N")) {
            return ResponseUtil.ok("N", loginResult.get("message"), null);
        }

        String accessToken = loginResult.get("token");
        String refreshToken = jwtUtil.generateRefreshToken(userId);

        memberService.updateAccessToken(userId, accessToken);
        // DB에 refreshToken 저장
        memberService.updateRefreshToken(userId, refreshToken);

        // 쿠키 저장
        Cookie accessCookie = new Cookie("AccessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 60 * 2); // 2시간
//        accessCookie.setDomain(domain); // ← 프론트 도메인 설정 (공통 도메인일때만 사용)
        // SameSite=None 금지
        // 이 속성은 Secure가 필요해서 HTTP에선 작동 안 함 //Lax
        accessCookie.setAttribute("SameSite", "None");


        Cookie refreshCookie = new Cookie("RefreshToken", refreshToken);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(true);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24 * 7); // 7일
//        refreshCookie.setDomain(domain); // ← 프론트 도메인 설정 (공통 도메인일때만 사용)
        refreshCookie.setAttribute("SameSite", "None");

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        String ip = request.getRemoteAddr(); // ← 클라이언트 IP 가져오기
        memberService.updateLoginInfo(userId, ip);

        return ResponseUtil.ok("Y", "로그인이 완료되었습니다.", null);
    }

    @PostMapping("/check-email")
    public ResponseEntity<?> checkEmail(@RequestBody Map<String, String> body) {

        String email = body.get("email");
        String userId = body.get("userId");
        boolean exists = memberService.getCheckEmail(email, userId);
        if (exists) {
            return ResponseUtil.ok("N", "이미 등록된 이메일입니다.", null);
        }
        return ResponseUtil.ok("Y", "사용 가능한 이메일입니다.", null);
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @CookieValue(value = "RefreshToken", required = false) String refreshToken,
            HttpServletRequest request,
            HttpServletResponse response) {

        System.out.println("refreshToken 확인 완료: " + refreshToken);
        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseUtil.ok("N", "RefreshToken이 없습니다.", null);
        }

        try {
            String userId = jwtUtil.validateToken(refreshToken);

            // DB의 리프레시 토큰과 비교
            String storedToken = memberService.getRefreshToken(userId);
            if (!refreshToken.equals(storedToken)) {
                return ResponseUtil.ok("N", "RefreshToken이 일치하지 않습니다.", null);
            }

            MemberDTO member = memberService.getUserByUserId(userId)
                    .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

            // 새로운 accessToken 발급
            String newAccessToken = jwtUtil.generateToken(
                    member.getIdx(),
                    userId,
                    member.getEmail(),
                    member.getName(),
                    memberService.getUserRole(userId)
            );
            System.out.println("AccessToken 재발급 완료: " + newAccessToken);
            memberService.updateAccessToken(userId, newAccessToken);
            Cookie accessCookie = new Cookie("AccessToken", newAccessToken);
            accessCookie.setHttpOnly(true);
            accessCookie.setSecure(true);
            accessCookie.setPath("/");
            accessCookie.setMaxAge(60 * 60 * 2);
//            accessCookie.setDomain(domain); // ← 프론트 도메인 설정 (공통 도메인일때만 사용)
            accessCookie.setAttribute("SameSite", "None");

            response.addCookie(accessCookie);

            String ip = request.getRemoteAddr(); // ← 클라이언트 IP 가져오기
            memberService.updateLoginInfo(userId, ip);

            return ResponseUtil.ok("Y", "AccessToken이 재발급되었습니다.", Map.of("accessToken", newAccessToken));

        } catch (ExpiredJwtException e) {
            return ResponseUtil.ok("N", "RefreshToken이 만료되었습니다. 다시 로그인 해주세요.", null);
        } catch (Exception e) {
            return ResponseUtil.ok("N", "토큰 검증 실패", null);
        }
    }


    @GetMapping("/loginCheck")
    public ResponseEntity<?> getUserInfo(@CookieValue(value = "AccessToken", required = false) String token) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }

        try {
            Claims claims = jwtUtil.getClaims(token);

            String userId = claims.getSubject();
            String idx = (String) claims.get("idx");
            String role = ((String) claims.get("role")).replaceFirst("^ROLE_", "");
            String name = (String) claims.get("name");

            return ResponseUtil.ok("Y", "유저 정보 조회 완료",
                    Map.of(
                            "idx", idx,
                            "userId", userId,
                            "name", name,
                            "role", role,
                            "accessToken", token,
                            "maintenanceMode", adminSettingsService.isMaintenanceMode()
                    )
            );
        } catch (ExpiredJwtException e){
            return ResponseEntity.status(401).body("AccessToken 만료");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("AccessToken 검증 실패");
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(value = "AccessToken", required = false) String token,
                                    HttpServletResponse response) {

        if (token != null) {
            String userId = jwtUtil.validateToken(token);
            memberService.deleteRefreshToken(userId); // DB에서 삭제
        }

        // 쿠키 삭제 시 Secure, SameSite, Domain까지 완전히 맞춰야 함
        for (String cookieName : List.of("AccessToken", "RefreshToken")) {
            Cookie cookie = new Cookie(cookieName, null);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            // 도메인이 다를 경우 (백엔드: Render, 프론트: Vercel),
            // 쿠키는 크롬의 "3rd-party 쿠키 제한" 정책 때문에 크롬시크릿모드, 모바일 차단될 수 있음
//            cookie.setDomain(domain); // ← 프론트 도메인 설정 (공통 도메인일때만 사용)
            cookie.setAttribute("SameSite", "None");

            response.addCookie(cookie);
        }

        return ResponseUtil.ok("Y", "로그아웃 완료", null);
    }

    @PostMapping("/find-id")
    public ResponseEntity<?> findId(@RequestBody FindIdRequestDTO dto) {
        try {
            authService.sendFindIdLink(dto);
            return ResponseUtil.ok("Y", "이메일 전송 성공", null);
        } catch (IllegalStateException e) {
            return ResponseUtil.ok("N", e.getMessage(),null);
        } catch (Exception e) {
            return ResponseUtil.serverError(e.getMessage());
        }
    }

    @PostMapping("/confirm-find-id")
    public ConfirmFindIdResponse confirmFindId(@RequestBody ConfirmFindIdRequest request) {
        return authService.confirmFindId(request.getToken());
    }

    // AuthController.java
    @PostMapping("/find-password")
    public ResponseEntity<?> findPassword(@RequestBody FindIdRequestDTO dto) {
        try {
            authService.sendResetPasswordLink(dto);
            return ResponseUtil.ok("Y", "비밀번호 재설정 링크가 이메일로 전송되었습니다.", null);
        } catch (IllegalStateException e) {
            return ResponseUtil.ok("N", e.getMessage(),null);
        } catch (Exception e) {
            return ResponseUtil.serverError(e.getMessage());
        }
    }

    // 1. 비밀번호 재설정 토큰 검증
    @PostMapping("/verify-reset-token")
    public ResponseEntity<?> verifyResetToken(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String message = authService.verifyResetToken(token);

            if ("Y".equals(message)) {
                return ResponseUtil.ok("Y", "토큰 인증이 완료되었습니다.", null);
            } else {
                return ResponseUtil.ok("N", message, null);
            }
        } catch (Exception e) {
            return ResponseUtil.serverError("서버 오류: " + e.getMessage());
        }
    }

    // 2. 비밀번호 재설정
    @PostMapping("/update-password")
    public ResponseEntity<?> ResetUpdatePassword(@RequestBody ResetPasswordRequest dto) {
        try {
            boolean updated = authService.updatePassword(dto.getToken(), dto.getNewPassword());
            if (updated) {
                return ResponseUtil.ok("Y", "비밀번호 변경 성공", null);
            } else {
                return ResponseUtil.ok("N", "비밀번호 변경에 실패하였습니다.", null);
            }
        } catch (Exception e) {
            return ResponseUtil.serverError("서버 오류: " + e.getMessage());
        }
    }

    // 개인정보처리방침,서비스이용약관 조회
    @GetMapping("/terms")
    public ResponseEntity<?> getTermsAndPolicy() {
        Map<String, String> termsAndPolicy = adminSettingsService.getTermsAndPolicy();
        return ResponseUtil.ok("Y", "약관 및 개인정보처리방침 조회 완료", termsAndPolicy);
    }

}
