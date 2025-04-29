package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Notification;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByReceiverIdxOrderByRegDateDesc(Long receiverId, Pageable pageable);
    Optional<Notification> findByIdx(Long idx); // idx 필드를 기준으로 조회

    Integer countByReceiverIdxAndIsRead(Long receiverIdx, UseStatus useStatus);
    List<Notification> findByReceiverIdxAndIsRead(Long userIdx, UseStatus useStatus);
}
