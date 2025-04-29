package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.company.CompanyRequestDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.entity.Company;
import JobBridgeKo.com.JobBridge.repository.CompanyRepository;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class CompanyService {
    private final CompanyRepository companyRepository;
    private final JwtUtil jwtUtil;
    private final CommonUtils commonUtils;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.domain}")
    private String domain;

    public boolean checkCompanyExists(String userId) {
        return companyRepository.findByUserId(userId).isPresent();
    }

    @Transactional
    public void saveCompany(String userId, CompanyRequestDTO dto) throws IOException {
        companyRepository.findByUserId(userId).ifPresent(companyRepository::delete);

        String logoUrl = commonUtils.saveThumbnail(dto.getLogo(),"png");

        Company company = Company.builder()
                .userId(userId)
                .logo(logoUrl)
                .companyType(dto.getCompanyType())
                .companyName(dto.getCompanyName())
                .bizNumber(dto.getBizNumber())
                .ceoName(dto.getCeoName())
                .industry(dto.getIndustry())
                .employeeCount(dto.getEmployeeCount())
                .foundedDate(dto.getFoundedDate())
                .zipCode(dto.getZipCode())
                .address(dto.getAddress())
                .addressDetail(dto.getAddressDetail())
                .city(dto.getCity())
                .homepageUrl(dto.getHomepageUrl())
                .regDate(LocalDateTime.now())
                .build();

        companyRepository.save(company);
    }

    public CompanyResponseDTO getCompanyDetail(String userId) {
        Company company = companyRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("회사 정보가 존재하지 않습니다."));
        return CompanyResponseDTO.builder()
                .userId(userId)
                .logo(domain + company.getLogo())
                .companyType(company.getCompanyType())
                .companyName(company.getCompanyName())
                .bizNumber(company.getBizNumber())
                .ceoName(company.getCeoName())
                .industry(company.getIndustry())
                .employeeCount(company.getEmployeeCount())
                .foundedDate(company.getFoundedDate())
                .zipCode(company.getZipCode())
                .address(company.getAddress())
                .addressDetail(company.getAddressDetail())
                .city(company.getCity())
                .homepageUrl(company.getHomepageUrl())
                .build();
    }

    @Transactional
    public void updateCompany(String userId, CompanyRequestDTO companyDTO) throws IOException {
        Company company = companyRepository.findByUserId(userId)
                                           .orElseThrow(() -> new IllegalArgumentException("회사 정보가 존재하지 않습니다."));

        MultipartFile logo = companyDTO.getLogo();
        String logoUrl = company.getLogo(); // 기존 이미지 유지
        if (logo != null && !logo.isEmpty()) {
            logoUrl = commonUtils.saveThumbnail(logo,"png");
        }

        // 기존 엔티티의 값들을 업데이트 (setter 또는 update 메서드 사용)
        company.update(
                companyDTO.getCompanyType(),
                companyDTO.getCompanyName(),
                companyDTO.getBizNumber(),
                companyDTO.getCeoName(),
                companyDTO.getIndustry(),
                companyDTO.getEmployeeCount(),
                companyDTO.getFoundedDate(),
                companyDTO.getZipCode(),
                companyDTO.getAddress(),
                companyDTO.getAddressDetail(),
                companyDTO.getCity(),
                companyDTO.getHomepageUrl(),
                logoUrl
        );

        // companyRepository.save(company); // 실제로는 save 안 해도 변경 감지로 자동 반영됨
    }

    public CompanyResponseDTO getCompanyDetailByIdx(Long idx) {
        Company company = companyRepository.findOneByIdx(idx);
        return CompanyResponseDTO.builder()
                .userId(company.getUserId())
                .logo(domain + company.getLogo())
                .companyType(company.getCompanyType())
                .companyName(company.getCompanyName())
                .bizNumber(company.getBizNumber())
                .ceoName(company.getCeoName())
                .industry(company.getIndustry())
                .employeeCount(company.getEmployeeCount())
                .foundedDate(company.getFoundedDate())
                .zipCode(company.getZipCode())
                .address(company.getAddress())
                .addressDetail(company.getAddressDetail())
                .city(company.getCity())
                .homepageUrl(company.getHomepageUrl())
                .build();
    }
}
