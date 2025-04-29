package JobBridgeKo.com.JobBridge.entity;

import JobBridgeKo.com.JobBridge.dto.AdminSettingsDTO;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class AdminSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idx;

    private String siteTitle;
    private String siteDescription;
    private String adminId;
    private String adminEmail;
    private boolean maintenanceMode;
    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String termsOfService;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String privacyPolicy;

    public void updateFromDTO(AdminSettingsDTO dto) {
        this.siteTitle = dto.getSiteTitle();
        this.siteDescription = dto.getSiteDescription();
        this.adminId = dto.getAdminId();
        this.adminEmail = dto.getAdminEmail();
        this.maintenanceMode = dto.isMaintenanceMode();
        this.termsOfService = dto.getTermsOfService();
        this.privacyPolicy = dto.getPrivacyPolicy();
    }
}
