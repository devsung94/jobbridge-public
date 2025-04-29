package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.AdminSettingsDTO;
import JobBridgeKo.com.JobBridge.entity.AdminSettings;
import JobBridgeKo.com.JobBridge.repository.AdminSettingsRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminSettingsService {

    private final AdminSettingsRepository adminSettingsRepository;
    private final MemberRepository memberRepository;

    public AdminSettingsDTO getSettings() {
        AdminSettings entity = adminSettingsRepository.findTopByOrderByIdxAsc().orElseGet(AdminSettings::new);
        return toDTO(entity);
    }

    public void AdminUpdateSettings(AdminSettingsDTO dto) {
        AdminSettings entity = adminSettingsRepository.findTopByOrderByIdxAsc().orElseGet(AdminSettings::new);
        entity.updateFromDTO(dto);
        adminSettingsRepository.save(entity);
    }

    private AdminSettingsDTO toDTO(AdminSettings entity) {
        AdminSettingsDTO dto = new AdminSettingsDTO();
        dto.setSiteTitle(entity.getSiteTitle());
        dto.setSiteDescription(entity.getSiteDescription());
        dto.setAdminId(entity.getAdminId());
        dto.setAdminEmail(entity.getAdminEmail());
        dto.setMaintenanceMode(entity.isMaintenanceMode());
        dto.setTermsOfService(entity.getTermsOfService());
        dto.setPrivacyPolicy(entity.getPrivacyPolicy());
        return dto;
    }


    // 점검모드 확인
    public boolean isMaintenanceMode() {
        return adminSettingsRepository.findTopByOrderByIdxAsc()
                .map(AdminSettings::isMaintenanceMode)
                .orElse(false);
    }

    public void updateTokenSettings(AdminSettingsDTO dto) {
        AdminSettings entity = adminSettingsRepository.findTopByOrderByIdxAsc()
                .orElseGet(AdminSettings::new);

        boolean wasOn = entity.isMaintenanceMode();     // 기존 상태 확인
        boolean turnedOn = dto.isMaintenanceMode();     // 새로 요청된 값 확인

        entity.updateFromDTO(dto);                      // 값 복사
        adminSettingsRepository.save(entity);           // 저장

        // ✅ 점검모드 OFF → ON으로 바뀌는 시점이라면
        if (!wasOn && turnedOn) {
            memberRepository.deleteAllRefreshTokens();  // 전체 리프레시 토큰 삭제
        }
    }


    public Map<String, String> getTermsAndPolicy() {
        AdminSettings settings = adminSettingsRepository.findTopByOrderByIdxAsc().orElseGet(AdminSettings::new);

        return Map.of(
                "termsOfService", Optional.ofNullable(settings.getTermsOfService()).orElse(""),
                "privacyPolicy", Optional.ofNullable(settings.getPrivacyPolicy()).orElse("")
        );
    }

}

