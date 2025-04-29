package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Company;
import JobBridgeKo.com.JobBridge.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByUserId(String userId);
    Company findOneByUserId(String userId);
    Company findOneByIdx(Long idx);
}
