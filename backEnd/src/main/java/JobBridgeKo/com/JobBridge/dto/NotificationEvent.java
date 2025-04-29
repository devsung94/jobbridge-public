package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.enums.UseStatus;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationEvent {
    private Long senderIdx;    // 알림 전송 사용자 IDX
    private Long receiverIdx;    // 알림 받을 사용자 IDX
    private String message;     // 알림 내용
    private String link;        // 클릭 시 이동할 링크
    private String ip;          // 아이피
    private UseStatus isRead;   // 읽음 처리
    private UseStatus isUse;    // 사용 여부
}

