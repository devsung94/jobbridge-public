package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.entity.Notification;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {

    private Long idx;
    private Long senderIdx;
    private Long receiverIdx;
    private String message;
    private String link;
    private String ip;
    private UseStatus isRead;
    private UseStatus isUse;
    private LocalDateTime regDate;
    private LocalDateTime editDate;

    public static NotificationDTO from(Notification notification) {
        return NotificationDTO.builder()
                .idx(notification.getIdx())
                .senderIdx(notification.getSenderIdx())
                .receiverIdx(notification.getReceiverIdx())
                .message(notification.getMessage())
                .link(notification.getLink())
                .ip(notification.getIp())
                .isRead(notification.getIsRead())
                .isUse(notification.getIsUse())
                .regDate(notification.getRegDate())
                .editDate(notification.getEditDate())
                .build();
    }
}
