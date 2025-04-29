package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.entity.Member;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    Optional<Member> findByUserId(String userId);

    @Query("SELECT m FROM Member m WHERE UPPER(m.userId) = UPPER(:userId)")
    Optional<Member> findByUserIdIgnoreCase(@Param("userId") String userId);

    Optional<Member> findByEmail(String email);
    Page<Member> findByRoleNot(String role, Pageable pageable);
    Boolean deleteByUserId(String userId);


    @Query("SELECT COUNT(m) FROM Member m WHERE DATE(m.regDate) = :date AND m.role <> 'admin'")
    int countByCreatedDate(@Param("date") LocalDate date);

    @Query("SELECT COUNT(m) FROM Member m WHERE DATE(m.regDate) <= :date AND m.role <> 'admin'")
    int countByCreatedDateBeforeEqual(@Param("date") LocalDate date);


    @Query("""
        SELECT new JobBridgeKo.com.JobBridge.dto.MemberDTO(m)
        FROM Member m
        WHERE m.role != 'admin'
        AND (:role IS NULL OR m.role = :role)
        AND (:userId IS NOT NULL AND m.userId LIKE CONCAT('%', :userId, '%'))
    """)
    Page<MemberDTO> findByRoleAndUserIdContaining(
            @Param("role") String role,
            @Param("userId") String userId,
            Pageable pageable
    );

    @Query("""
        SELECT new JobBridgeKo.com.JobBridge.dto.MemberDTO(m)
        FROM Member m
        WHERE m.role != 'admin'
        AND (:role IS NULL OR m.role = :role)
        AND (:name IS NOT NULL AND m.name LIKE CONCAT('%', :name, '%'))
    """)
    Page<MemberDTO> findByRoleAndNameContaining(
            @Param("role") String role,
            @Param("name") String name,
            Pageable pageable
    );

    @Query("""
        SELECT new JobBridgeKo.com.JobBridge.dto.MemberDTO(m)
        FROM Member m
        WHERE m.role != 'admin'
          AND (:role IS NULL OR m.role = :role)
    """)
    Page<MemberDTO> findAllDto(@Param("role") String role, Pageable pageable);

    @Modifying
    @Query("UPDATE Member m SET m.refreshToken = null")
    void deleteAllRefreshTokens();
}
