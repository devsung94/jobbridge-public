// 수정된 ResumeRequestDTO - MultipartFile 기반 처리
package JobBridgeKo.com.JobBridge.dto.resume;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeRequestDTO {
    private String userId;
    private MultipartFile photo;
    private String isExperienced;
    private String careerSummary;
    private String coverLetter;

    @Builder.Default
    private List<CareerDTO> careers = new ArrayList<>();
    @Builder.Default
    private List<EducationDTO> educationList = new ArrayList<>();
    @Builder.Default
    private List<SkillDTO> skillsList = new ArrayList<>();
    @Builder.Default
    private List<PortfolioDTO> portfolioList = new ArrayList<>();
    @Builder.Default
    private List<CertificationDTO> certificationsList = new ArrayList<>();
}

