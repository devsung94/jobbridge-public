package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.PasswordResetToken;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
    Optional<PasswordResetToken> findByEmailAndConfirmedAndExpiresAtAfter(String email, UseStatus confirmed, LocalDateTime now);
}
