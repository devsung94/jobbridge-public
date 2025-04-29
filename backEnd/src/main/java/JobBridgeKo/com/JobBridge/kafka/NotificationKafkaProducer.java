package JobBridgeKo.com.JobBridge.kafka;


import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationKafkaProducer {

    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public void sendNotification(NotificationEvent event) {
        try {
            log.info("📤 Kafka 전송 시도: {}", event);
            String json = objectMapper.writeValueAsString(event);
            kafkaTemplate.send("notification-topic", json);
            log.info("✅ Kafka 전송 완료");
        } catch (Exception e) {
            log.error("❌ Kafka 전송 실패", e);  // ✅ 에러 로그 찍기
            throw new RuntimeException("Kafka 알림 직렬화 실패", e);
        }
    }
}