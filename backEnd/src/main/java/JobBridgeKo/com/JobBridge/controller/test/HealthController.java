package JobBridgeKo.com.JobBridge.controller.test;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@RequestMapping
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class HealthController {
    private final StringRedisTemplate redisTemplate;

    @GetMapping("/")
    public String rootHealthCheck() {
        return "JobBridge is running!";
    }

    @GetMapping("/api/health")
    public String healthCheck() {
        return "OK";
    }

    @GetMapping("/api/redis-test")
    public String redisTest() {
        try {
            // 테스트용으로 키-밸류 저장
            redisTemplate.opsForValue().set("test-key", "Hello Redis!");

            // 다시 조회
            String value = redisTemplate.opsForValue().get("test-key");

            return "Redis 연결 성공! 저장된 값: " + value;
        } catch (Exception e) {
            return "Redis 연결 실패: " + e.getMessage();
        }
    }
}
