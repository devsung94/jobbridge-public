package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Visitor;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitorRepository extends JpaRepository<Visitor, Long> {
    Page<Visitor> findByIpAddressContainingOrderByIdxDesc(String ipAddress, Pageable pageable);

    Page<Visitor> findByPathContainingOrderByIdxDesc(String path, Pageable pageable);

    Page<Visitor> findAllByOrderByIdxDesc(Pageable pageable);

    List<Visitor> findByIdxIn(List<Long> postIdxList);
}
