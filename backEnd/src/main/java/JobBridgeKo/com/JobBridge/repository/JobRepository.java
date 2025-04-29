package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.Date;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

    @Query("""
    SELECT j FROM Job j 
        JOIN j.company c 
        WHERE j.startDate <= :now
          AND j.endDate >= :now
          AND (:status IS NULL OR j.isUse = :status)
          AND (
            (:city IS NULL OR :city = 'all' OR LOWER(c.city) = LOWER(:city))
          )
          AND (
            (:keyword IS NULL OR :keyword = '' OR
             LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
             LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%')))
          )
        ORDER BY j.regDate DESC
    """)
    Page<Job> searchJobs(
            @Param("now") Date now,
            @Param("status") UseStatus status,
            @Param("city") String city,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Optional<Job> findByIdx(Long idx);

    @Query("SELECT j FROM Job j WHERE j.userId = :userId AND j.isUse = :status ORDER BY j.regDate DESC")
    Page<Job> findByUserId(@Param("status") UseStatus status, @Param("userId") String userId, Pageable pageable);

    @Query("""
        SELECT j FROM Job j 
        JOIN j.company c 
        WHERE j.startDate <= :now
          AND j.endDate >= :now
          AND j.isUse = :status 
          AND (
            LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) 
            OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) 
            OR LOWER(c.companyName) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        ORDER BY j.regDate DESC
        """)
    Page<Job> searchJobByKeywordWithCompanyName(
            @Param("now") Date now,
            @Param("status") UseStatus status,
            @Param("keyword") String keyword,
            Pageable pageable
    );

    Page<Job> findByCompany_CompanyNameContainingIgnoreCase(String companyName, Pageable pageable);
    Page<Job> findByTitleContainingIgnoreCase(String title, Pageable pageable);
    Page<Job> findByCompany_CompanyNameContainingIgnoreCaseAndTitleContainingIgnoreCase(String companyName, String title, Pageable pageable);


    void deleteByUserId(String userId);
}