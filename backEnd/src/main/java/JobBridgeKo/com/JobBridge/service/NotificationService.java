package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.NotificationDTO;
import JobBridgeKo.com.JobBridge.entity.Notification;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class NotificationService {
    private final NotificationRepository notificationRepository;

    // 사용자별 알림 목록 조회
    public Page<NotificationDTO> getNotificationsByUserIdx(Long userIdx, Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "regDate")
        );

        return notificationRepository.findByReceiverIdxOrderByRegDateDesc(userIdx,sortedPageable)
                .map(NotificationDTO::from);
    }

    // 알림 읽음 처리
    public void markAsRead(Long notificationIdx) {
        Notification notification = notificationRepository.findByIdx(notificationIdx)
                .orElseThrow(() -> new IllegalArgumentException("알림이 존재하지 않습니다."));
        notification.setIsRead(UseStatus.Y);
        notificationRepository.save(notification);
    }

    public Integer getUnreadCount(Long receiverIdx) {
        return notificationRepository.countByReceiverIdxAndIsRead(receiverIdx, UseStatus.N);
    }

    public void save(NotificationDTO dto) {
        Notification notification = Notification.builder()
                .senderIdx(dto.getSenderIdx())
                .receiverIdx(dto.getReceiverIdx())
                .message(dto.getMessage())
                .link(dto.getLink())
                .isRead(dto.getIsRead())
                .isUse(dto.getIsUse())
                .regDate(LocalDateTime.now())
                .build();

        notificationRepository.save(notification);
    }

    public void markAllAsRead(Long userIdx) {
        List<Notification> unreadNotifications = notificationRepository.findByReceiverIdxAndIsRead(userIdx, UseStatus.N);
        for (Notification notification : unreadNotifications) {
            notification.setIsRead(UseStatus.Y);
            notification.setEditDate(LocalDateTime.now());
        }
        notificationRepository.saveAll(unreadNotifications);
    }

}
