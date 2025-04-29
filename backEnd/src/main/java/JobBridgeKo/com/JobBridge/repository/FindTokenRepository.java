package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.FindToken;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

// FindTokenRepository.java
public interface FindTokenRepository extends JpaRepository<FindToken, String> {
    Optional<FindToken> findByToken(String token);
    Optional<FindToken> findByEmailAndConfirmedAndExpiresAtAfter(
            String email,
            UseStatus confirmed,
            LocalDateTime now
    );
}

