package JobBridgeKo.com.JobBridge.controller.notification;

import JobBridgeKo.com.JobBridge.dto.NotificationDTO;
import JobBridgeKo.com.JobBridge.service.NotificationService;
import JobBridgeKo.com.JobBridge.util.CustomUserDetails;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class NotificationController {

    private final NotificationService notificationService;

    // 알림 조회
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String regDate,
            @CookieValue(value = "AccessToken", required = false) String token,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        Long userIdx = userDetails.getIdx();
        PageRequest pageable = PageRequest.of(page - 1, size);

        Page<NotificationDTO> notificationPage = notificationService.getNotificationsByUserIdx(userIdx, pageable);
        if (notificationPage.isEmpty()) return ResponseUtil.ok("N", "조회 된 목록이 없습니다.", null);

        return ResponseUtil.ok("Y", "알림 조회가 완료되었습니다.",Map.of(
                "notifications",notificationPage.getContent(),
                "totalPages",notificationPage.getTotalPages()
        ));
    }

    // 알림 읽음 처리(클릭시)
    @PostMapping("/{idx}/read")
    public ResponseEntity<?> markNotificationAsRead(
            @CookieValue(value = "AccessToken", required = false) String token,
            @PathVariable Long idx) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        notificationService.markAsRead(idx);
        return ResponseEntity.ok().build();
    }

    // 안읽은 알림만 뱃지로 표시
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(
            @CookieValue(value = "AccessToken", required = false) String token,
            @AuthenticationPrincipal CustomUserDetails user) {
        if (token == null || token.isEmpty()) {
            return ResponseEntity.status(401).body("AccessToken이 없습니다.");
        }
        return ResponseUtil.ok("Y", "안읽은 알림 뱃지 조회 완료되었습니다.",
                Map.of("count", notificationService.getUnreadCount(user.getIdx())));
    }

    @PostMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        Long userIdx = userDetails.getIdx();
        notificationService.markAllAsRead(userIdx);
        return ResponseUtil.ok("Y", "모든 알림이 읽음 처리되었습니다.", null);
    }


}
