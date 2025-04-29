package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommunityRepository extends JpaRepository<Community,Long> {
    Optional<Community> findByIdx(Long idx);
    Optional<Community> findByUserId(String userId);
    Page<Community> findByIsUse(CommunityStatus.IsUse isUse, Pageable pageable);
    Page<Community> findByIsUseAndTitleContainingIgnoreCase(CommunityStatus.IsUse isUse, String keyword, Pageable pageable);
    Page<Community> findByIsUseAndCategory(CommunityStatus.IsUse isUse, String category, Pageable pageable);
    Page<Community> findByIsUseAndCategoryAndTitleContainingIgnoreCase(CommunityStatus.IsUse isUse, String category, String keyword, Pageable pageable);

    List<Community> findByIdxIn(List<Long> postIdxList);


    Page<Community> findByCategoryAndTitleContainingIgnoreCase(String category, String keyword, Pageable pageable);

    Page<Community> findByTitleContainingIgnoreCase(String keyword, Pageable pageable);

    Page<Community> findByCategory(String category, Pageable pageable);

    Page<Community> findAll(Pageable pageable);


    Page<Community> findByCategoryAndTitleContainingIgnoreCaseAndUserIdAndUserNameContainingIgnoreCase(String category, String title, String userId, String name, Pageable sortedPageable);

    void deleteByUserId(String userId);

    Page<Community> findByUserIdAndIsUse(String userId, CommunityStatus.IsUse isUse, Pageable pageable);

}
