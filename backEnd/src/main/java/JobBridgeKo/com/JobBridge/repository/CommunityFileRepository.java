package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityFile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommunityFileRepository extends JpaRepository<CommunityFile,Long> {
    void deleteByCommunity(Community community);
    List<CommunityFile> findByCommunity(Community community);
}
