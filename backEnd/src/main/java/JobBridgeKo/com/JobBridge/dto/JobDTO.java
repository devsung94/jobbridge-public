package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.entity.Company;
import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Date;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDTO implements Serializable {
    private Long idx;
    private String userId;
    private String title;
    private String description;
    private String experience;
    private String education;
    private String salary;
    private String preferred;
    private UseStatus isUse;

    private Date startDate;
    private Date endDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    // 회사 정보 요약 필드
    private String logo;            // 회사로고
    private String companyType;     // 회사유형
    private String companyName;     // 회사명
    private String ceoName;         // 대표자명
    private String industry;        // 업종
    private Integer employeeCount;  // 사원 수
    private LocalDate foundedDate;  // 설립일
    private String companyAddress;  // 회사주소

    // 지원자 수
    private int applicantCount;


    // Job Entity → JobDTO 변환하는 정적 메서드 추가
    public static JobDTO from(Job job, String domain, int applicantCount) {
        Company company = job.getCompany(); // 연관관계가 설정돼 있다고 가정
        return JobDTO.builder()
                .idx(job.getIdx())
                .userId(job.getUserId())
                .title(job.getTitle())
                .description(job.getDescription())
                .experience(job.getExperience())
                .education(job.getEducation())
                .salary(job.getSalary())
                .preferred(job.getPreferred())
                .isUse(job.getIsUse())
                .startDate(job.getStartDate())
                .endDate(job.getEndDate())
                .regDate(job.getRegDate())

                // 회사 정보 요약
                .logo(domain + company.getLogo())
                .companyType(company.getCompanyType())
                .companyName(company.getCompanyName())
                .ceoName(company.getCeoName())
                .industry(company.getIndustry())
                .employeeCount(company.getEmployeeCount())
                .foundedDate(company.getFoundedDate())
                .companyAddress(company.getAddress() + " " + company.getAddressDetail())

                .applicantCount(applicantCount)

                .build();
    }
}
