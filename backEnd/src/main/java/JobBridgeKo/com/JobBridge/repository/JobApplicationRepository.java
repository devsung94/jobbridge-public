package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.entity.JobApplication;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    boolean existsByJobIdxAndUserId(Long jobIdx, String userId);
    Optional<JobApplication> findByJobIdxAndUserIdAndIsUseAndIsStatusNot(Long jobIdx, String userId, UseStatus isUse, JobApplicationStatus isStatus);
    List<JobApplication> findAllByJob_Idx(Long jobIdx);
    Page<JobApplication> findByJob_Idx(Long jobIdx, Pageable pageable);

    Page<JobApplication> findByUserId(String userId, Pageable pageable);

    int countByJob_Idx(Long idx);

    boolean existsByJob_IdxAndUserIdAndIsUse(Long jobIdx, String userId, UseStatus useStatus);

    int countByJob(Job job);

    Optional<JobApplication> findTopByJobIdxAndUserIdOrderByRegDateDesc(Long jobIdx, String userId);

    Optional<JobApplication> findByJobIdxAndUserIdAndIsUseAndIsStatusNotAndIsStatusNot(Long jobIdx, String userId, UseStatus useStatus, JobApplicationStatus jobApplicationStatus, JobApplicationStatus jobApplicationStatus1);

    Optional<JobApplication> findByJobIdxAndUserIdAndIsRead(Long jobIdx, String userId, UseStatus isRead);

    @Query("SELECT ja FROM JobApplication ja " +
            "WHERE ja.job.idx = :jobIdx " +
            "AND ja.userId = :userId " +
            "AND ja.isUse = 'Y' " +
            "AND ja.isStatus NOT IN ('N', 'Y') " +
            "AND ja.isRead <> 'Y'")
    Optional<JobApplication> findCancelableApplication(@Param("jobIdx") Long jobIdx,
                                                       @Param("userId") String userId);

    void deleteByUserId(String userId);
}
