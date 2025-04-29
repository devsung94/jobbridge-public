package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
@RequestMapping("/api/admin/cache")
public class AdminCacheController {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    /** Redis의 모든 키 조회 */
    @GetMapping("/keys")
    public List<String> getAllCacheKeys() {
        Set<String> keys = redisTemplate.keys("*");
        return keys != null ? new ArrayList<>(keys) : new ArrayList<>();
    }

    /** 등록된 Cache 이름 목록 조회 */
    @GetMapping("/cache-names")
    public List<String> getAllCacheNames() {
        return new ArrayList<>(cacheManager.getCacheNames());
    }

    /** Cache 이름으로 전체 clear */
    @PostMapping("/clear")
    public ResponseEntity<?> clearCacheByName(@RequestParam String cacheName) {
        Cache cache = cacheManager.getCache(cacheName);
        if (cache != null) {
            cache.clear();
            return ResponseUtil.ok("Y", "캐시 [" + cacheName + "] 초기화 완료", null);
        } else {
            return ResponseUtil.ok("N", "캐시 [" + cacheName + "] 찾을 수 없음", null);
        }
    }

    /** Redis Key 하나를 직접 삭제 */
    @PostMapping("/clear-key")
    public ResponseEntity<?> clearCacheKey(@RequestParam String cacheKey) {
        try {
            Boolean deleted = redisTemplate.delete(cacheKey);
            if (Boolean.TRUE.equals(deleted)) {
                return ResponseUtil.ok("Y", "캐시 키 [" + cacheKey + "] 삭제 완료", null);
            } else {
                return ResponseUtil.ok("N", "캐시 키 [" + cacheKey + "] 삭제 실패", null);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.ok("N", "캐시 키 삭제 중 오류 발생: " + e.getMessage(), null);
        }
    }

    /** 모든 Cache clear */
    @PostMapping("/clear-all")
    public ResponseEntity<?> clearAllCaches() {
        try {
            for (String cacheName : cacheManager.getCacheNames()) {
                Cache cache = cacheManager.getCache(cacheName);
                if (cache != null) {
                    cache.clear();
                }
            }
            return ResponseUtil.ok("Y", "모든 캐시 초기화 완료", null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseUtil.ok("N", "모든 캐시 초기화 중 오류 발생: " + e.getMessage(), null);
        }
    }
}
