package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, Long> {
    Optional<Resume> findByUserId(String userId);  // findById → findByUserid로 수정
    boolean existsByUserId(String userId);

}
