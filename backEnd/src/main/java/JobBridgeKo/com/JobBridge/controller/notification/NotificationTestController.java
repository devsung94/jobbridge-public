package JobBridgeKo.com.JobBridge.controller.notification;

import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.kafka.NotificationKafkaProducer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/test/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class NotificationTestController {

    private final NotificationKafkaProducer notificationKafkaProducer;

    @GetMapping("/send/{receiverIdx}")
    public ResponseEntity<String> testSend(@PathVariable Long receiverIdx) {
        try {
            NotificationEvent event = NotificationEvent.builder()
                    .senderIdx(123456L)
                    .receiverIdx(receiverIdx)
                    .message("🔥 새 댓글이 달렸습니다!")
                    .link("/community/123")
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build();

            log.info("🔔 테스트 알림 전송 준비: {}", event);
            notificationKafkaProducer.sendNotification(event);

            return ResponseEntity.ok("알림 발송 테스트 완료");
        } catch (Exception e) {
            log.error("❌ 알림 테스트 중 오류 발생", e);
            return ResponseEntity.status(500).body("테스트 실패: " + e.getMessage());
        }
    }

}
