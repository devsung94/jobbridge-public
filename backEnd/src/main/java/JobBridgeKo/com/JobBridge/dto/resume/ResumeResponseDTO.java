package JobBridgeKo.com.JobBridge.dto.resume;

import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResumeResponseDTO {
    private Long idx;

    private String userId;
    private String name;
    private String gender;
    private String birthDay;
    private String email;
    private String hp;
    private String zipCode;
    private String address;
    private String addressDetail;

    private String isExperienced;
    private String careerSummary;
    private String coverLetter;
    private String photo;

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
