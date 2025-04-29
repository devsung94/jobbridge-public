package JobBridgeKo.com.JobBridge.kafka;

import JobBridgeKo.com.JobBridge.dto.NotificationDTO;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationKafkaConsumer {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @KafkaListener(topics = "notification-topic", groupId = "jobbridge-group")
    public void consume(String messageJson) {
        try {
            NotificationDTO dto = objectMapper.readValue(messageJson, NotificationDTO.class);
            // 1. DB 저장
            notificationService.save(dto);

            // 2. WebSocket 실시간 전송
            messagingTemplate.convertAndSend(
                    "/topic/notifications/" + dto.getReceiverIdx(),
                    dto
            );

            log.info("알림 전송 완료 - 발신자: {}", dto.getSenderIdx());
            log.info("알림 전송 완료 - 수신자: {}", dto.getReceiverIdx());

        } catch (Exception e) {
            log.error("Kafka 메시지 처리 중 오류 발생", e);
        }
    }
}
