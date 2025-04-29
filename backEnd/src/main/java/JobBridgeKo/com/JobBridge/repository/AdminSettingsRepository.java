package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.AdminSettings;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminSettingsRepository extends JpaRepository<AdminSettings,Long> {
    Optional<AdminSettings> findTopByOrderByIdxAsc();
}
