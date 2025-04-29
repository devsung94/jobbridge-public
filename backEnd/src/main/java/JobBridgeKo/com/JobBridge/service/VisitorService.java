package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.entity.Visitor;
import JobBridgeKo.com.JobBridge.repository.VisitorRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class VisitorService {
    private final VisitorRepository visitorRepository;

    public void recordVisitor(String path, HttpServletRequest request) {
        String ip = getClientIP(request);
        String userAgent = request.getHeader("User-Agent");

        String origin = request.getHeader("Origin");
        if (origin == null) {
            origin = request.getScheme() + "://" + request.getServerName() + ":" + request.getServerPort();
        }

        String fullPath = origin + path;
        Visitor visitor = Visitor.builder()
                .ipAddress(ip)
                .path(fullPath)
                .userAgent(userAgent)
                .regDate(LocalDateTime.now())
                .build();

        visitorRepository.save(visitor);
    }

    private String getClientIP(HttpServletRequest request) {
        String[] headers = {
                "X-Forwarded-For",
                "Proxy-Client-IP",
                "WL-Proxy-Client-IP",
                "HTTP_CLIENT_IP",
                "HTTP_X_FORWARDED_FOR"
        };

        for (String header : headers) {
            String ip = request.getHeader(header);
            if (ip != null && ip.length() != 0 && !"unknown".equalsIgnoreCase(ip)) {
                return ip.split(",")[0];
            }
        }

        return request.getRemoteAddr();
    }
}
