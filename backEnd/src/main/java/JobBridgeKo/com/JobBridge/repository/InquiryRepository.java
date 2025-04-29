package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.Inquiry;
import JobBridgeKo.com.JobBridge.enums.InquiryType;
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
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {
    Optional<Inquiry> findByIdx(Long idx);
    Page<Inquiry> findByIsUse(UseStatus useStatus, Pageable pageable);

    // ✅ 문의글 필터 조건 검색 (title, userId, name)
    @Query("SELECT i FROM Inquiry i " +
            "JOIN Member m ON i.userId = m.userId " +
            "WHERE i.inquiryType = :inquiryType " +
            "AND (:title IS NULL OR i.title LIKE %:title%) " +
            "AND (:userId IS NULL OR i.userId = :userId) " +
            "AND (:name IS NULL OR m.name LIKE %:name%)")
    Page<Inquiry> findFilteredInquiries(
            @Param("inquiryType") InquiryType inquiryType,
            @Param("title") String title,
            @Param("userId") String userId,
            @Param("name") String name,
            Pageable pageable
    );
    List<Inquiry> findByInquiryTypeAndIsUseAndParentsIdxIn(InquiryType inquiryType, UseStatus isUse, List<Long> parentIdxs);
    Page<Inquiry> findByInquiryTypeAndIsUse(InquiryType inquiryType, UseStatus isUse, Pageable pageable);


    Page<Inquiry> findByInquiryType(InquiryType inquiryType, Pageable pageable);
    Page<Inquiry> findByInquiryTypeAndUserIdAndIsUse(InquiryType inquiryType, String userId, UseStatus isUse, Pageable pageable);

    List<Inquiry> findByInquiryTypeAndParentsIdxIn(InquiryType inquiryType, List<Long> idxs);

    void deleteByUserId(String userId);
}
