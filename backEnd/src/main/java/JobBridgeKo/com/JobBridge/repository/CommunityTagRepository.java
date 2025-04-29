package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityTag;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommunityTagRepository extends JpaRepository<CommunityTag,Long> {
    void deleteByCommunity(Community community);
}
