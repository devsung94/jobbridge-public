package JobBridgeKo.com.JobBridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "company")
public class Company {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "com_idx")
    private Long idx;

    @Column(name = "com_mb_id", unique = true, nullable = false, length = 255, columnDefinition = "VARCHAR(255) COLLATE utf8mb4_bin")
    private String userId;

    // 회사로고
    @Column(name = "com_logo")
    private String logo;

    // 회사유형
    @Column(name = "com_type")
    private String companyType;

    // 회사명
    @Column(name = "com_name")
    private String companyName;

    // 사업자등록증
    @Column(name = "com_biz_number", length = 15)
    private String bizNumber;

    // 대표자명
    @Column(name = "com_ceo_name")
    private String ceoName;

    // 업종
    @Column(name = "com_industry")
    private String industry;

    // 사원 수
    @Column(name = "com_employee_count")
    private Integer employeeCount;

    // 설립일
    @Column(name = "com_founded_date")
    private LocalDate foundedDate;

    // 우편번호
    @Column(name = "com_zcode")
    private String zipCode;

    // 회사 주소
    @Column(name = "com_addr")
    private String address;

    // 회사 상세주소
    @Column(name = "com_addr2")
    private String addressDetail;
    
    // 회사 지역
    @Column(name = "com_city")
    private String city;

    // 홈페이지
    @Column(name = "com_homepage_url")
    private String homepageUrl;

    @Column(name = "com_reg_date", columnDefinition = "DATETIME(0)")
    private LocalDateTime regDate;

    @Column(name = "com_edit_date", columnDefinition = "DATETIME(0)")
    private LocalDateTime editDate;


    public void update(String companyType, String companyName, String bizNumber, String ceoName,
                       String industry, Integer employeeCount, LocalDate foundedDate,
                       String zipCode, String address, String addressDetail, String city,
                       String homepageUrl, String logoUrl) {
        this.companyType = companyType;
        this.companyName = companyName;
        this.bizNumber = bizNumber;
        this.ceoName = ceoName;
        this.industry = industry;
        this.employeeCount = employeeCount;
        this.foundedDate = foundedDate;
        this.zipCode = zipCode;
        this.address = address;
        this.addressDetail = addressDetail;
        this.city = city;
        this.homepageUrl = homepageUrl;
        this.logo = logoUrl;
        this.editDate = LocalDateTime.now();
    }

}
