package JobBridgeKo.com.JobBridge.dto;

import lombok.Data;

@Data
public class AdminSettingsDTO {
    private String siteTitle;
    private String siteDescription;
    private String adminId;
    private String adminEmail;
    private boolean maintenanceMode;
    private String termsOfService;
    private String privacyPolicy;
}
