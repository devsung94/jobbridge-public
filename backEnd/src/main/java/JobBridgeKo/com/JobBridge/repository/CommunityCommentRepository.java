package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityComment;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<CommunityComment,Long> {
    Page<CommunityComment> findByCommunityIdxAndParentIsNullOrderByRegDateDesc(
            Long communityIdx, Pageable pageable);

    List<CommunityComment> findByParentOrderByRegDateAsc(
            CommunityComment parent);

    @Query("SELECT DISTINCT c.userId FROM CommunityComment c WHERE c.parent.id = :parentId OR c.id = :parentId")
    List<String> findDistinctUserIdByParentIdOrId(@Param("parentId") Long parentId);

    void deleteByUserId(String userId);
    @Query("""
        SELECT DISTINCT c.community 
        FROM CommunityComment c
        WHERE c.userId = :userId 
          AND c.isUse = :commentIsUse 
          AND c.community.isUse = :postIsUse
    """)
    Page<Community> findDistinctCommentedCommunitiesByUserId(
            @Param("userId") String userId,
            @Param("commentIsUse") CommunityStatus.IsUse commentIsUse,
            @Param("postIsUse") CommunityStatus.IsUse postIsUse,
            Pageable pageable
    );

    @Query("""
    SELECT c.community, c.id
    FROM CommunityComment c
    WHERE c.userId = :userId
      AND c.isUse = :commentIsUse
      AND c.community.isUse = :postIsUse
      AND c.regDate = (
          SELECT MAX(cc.regDate)
          FROM CommunityComment cc
          WHERE cc.userId = :userId
            AND cc.community = c.community
            AND cc.isUse = :commentIsUse
      )
""")
    Page<Object[]> findLatestCommentedCommunitiesWithCommentIdByUserId(
            @Param("userId") String userId,
            @Param("commentIsUse") CommunityStatus.IsUse commentIsUse,
            @Param("postIsUse") CommunityStatus.IsUse postIsUse,
            Pageable pageable
    );


    @Query("""
        SELECT c.id
        FROM CommunityComment c
        WHERE c.community.idx = :communityIdx
          AND c.parent IS NULL
          AND c.isUse = 'Y'
        ORDER BY c.regDate DESC
    """)
    List<Long> findTopLevelCommentIdxsByCommunityIdxOrderByRegDateDesc(@Param("communityIdx") Long communityIdx);

}
