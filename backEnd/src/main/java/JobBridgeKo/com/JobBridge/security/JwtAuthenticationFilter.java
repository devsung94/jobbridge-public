package JobBridgeKo.com.JobBridge.security;

import JobBridgeKo.com.JobBridge.service.AdminSettingsService;
import JobBridgeKo.com.JobBridge.util.CustomUserDetails;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.Map;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final AdminSettingsService adminSettingsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        // 점검 ON 일때
        if (adminSettingsService.isMaintenanceMode()) {
            String path = request.getRequestURI();

            // 관리자 API 외 모두 차단
            if (!path.startsWith("/api/admin")) {
                Optional<String> tokenOpt = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                        .filter(cookie -> "AccessToken".equals(cookie.getName()))
                        .map(Cookie::getValue)
                        .findFirst();

                if (tokenOpt.isPresent()) {
                    try {
                        String tokenValue = tokenOpt.get();
                        String role = jwtUtil.getRoleFromToken(tokenValue);

                        if (!"admin".equals(role)) {
                            Map<String, Object> errorResponse = ResponseUtil.unauthorized("현재 점검 중입니다. 관리자만 접근 가능합니다.").getBody();
                            response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                            response.setContentType("application/json");
                            response.setCharacterEncoding("UTF-8");
                            response.getWriter().write(new ObjectMapper().writeValueAsString(errorResponse));
                            return;
                        }

                    } catch (Exception e) {
                        // 토큰 파싱 실패 시 차단
                        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                        response.getWriter().write("인증 실패");
                        return;
                    }
                } else {
                    // 토큰 자체가 없을 경우에도 차단
                    Map<String, Object> errorResponse = ResponseUtil.unauthorized("현재 점검 중입니다. 관리자만 접근 가능합니다.").getBody();
                    response.setStatus(HttpServletResponse.SC_SERVICE_UNAVAILABLE);
                    response.setContentType("application/json");
                    response.setCharacterEncoding("UTF-8");
                    response.getWriter().write(new ObjectMapper().writeValueAsString(errorResponse));
                    return;
                }
            }
        }


        Optional<String> token = Arrays.stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                .filter(cookie -> "AccessToken".equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();

        if (token.isPresent()) {
            try {
                String tokenValue = token.get();
                String username = jwtUtil.validateToken(tokenValue);
                Long userIdx = jwtUtil.getIdxFromToken(tokenValue);
                String email = jwtUtil.getEmailFromToken(tokenValue);
                String role = jwtUtil.getRoleFromToken(tokenValue);

                CustomUserDetails customUserDetails = new CustomUserDetails(
                        userIdx,
                        username,
                        "",  // 비밀번호는 생략
                        email,
                        role
                );

                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        customUserDetails, null, customUserDetails.getAuthorities()
                );
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (ExpiredJwtException e) {
                Map<String, Object> errorResponse = ResponseUtil.unauthorized("AccessToken이 만료되었습니다.").getBody();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.setCharacterEncoding("UTF-8");
                response.getWriter().write(new ObjectMapper().writeValueAsString(errorResponse));
                return;

            } catch (Exception e) {
                SecurityContextHolder.clearContext();
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/")
                || path.startsWith("/api/jobs")
                || path.startsWith("/api/community")
                || path.startsWith("/api/visitor")
                || path.startsWith("/uploads");
    }
}
