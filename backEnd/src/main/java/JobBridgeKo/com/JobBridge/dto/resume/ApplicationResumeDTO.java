// 수정된 ResumeRequestDTO - MultipartFile 기반 처리
package JobBridgeKo.com.JobBridge.dto.resume;

import JobBridgeKo.com.JobBridge.enums.GenderType;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.Column;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResumeDTO {
    private Long idx;
    private String userId;
    private String photo;
    private String isExperienced;
    private String careerSummary;
    private String coverLetter;
    private GenderType gender;
    private String birthDay;
    private String name;
    private String email;
    private String hp;
    private String zipCode;
    private String address;
    private String addressDetail;

    private UseStatus isUse;
    private UseStatus isRead;
    private JobApplicationStatus isStatus;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @Builder.Default
    private List<ApplicationCareerDTO> careers = new ArrayList<>();
    @Builder.Default
    private List<ApplicationEducationDTO> educationList = new ArrayList<>();
    @Builder.Default
    private List<ApplicationSkillDTO> skillsList = new ArrayList<>();
    @Builder.Default
    private List<ApplicationPortfolioDTO> portfolioList = new ArrayList<>();
    @Builder.Default
    private List<ApplicationCertificationDTO> certificationsList = new ArrayList<>();
}

