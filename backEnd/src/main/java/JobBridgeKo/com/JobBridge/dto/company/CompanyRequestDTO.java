package JobBridgeKo.com.JobBridge.dto.company;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequestDTO {
    private String userId;
    private MultipartFile logo; // 사진 파일의 URL 또는 경로
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
