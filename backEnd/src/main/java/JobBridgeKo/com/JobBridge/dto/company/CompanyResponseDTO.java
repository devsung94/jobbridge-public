package JobBridgeKo.com.JobBridge.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyResponseDTO {
    private Long idx;
    private String userId;
    private String logo;
    private String companyType;
    private String companyName;
    private String bizNumber;
    private String ceoName;
    private String industry;
    private Integer employeeCount;
    private LocalDate foundedDate;
    private String zipCode;
    private String address;
    private String addressDetail;
    private String city;
    private String homepageUrl;
}
