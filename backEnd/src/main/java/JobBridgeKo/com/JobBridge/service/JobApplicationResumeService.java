package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.resume.ApplicationPortfolioDTO;
import JobBridgeKo.com.JobBridge.entity.*;
import JobBridgeKo.com.JobBridge.entity.resume.*;
import JobBridgeKo.com.JobBridge.repository.JobApplicationResumeRepository;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobApplicationResumeService {

    private final JobApplicationResumeRepository jobApplicationResumeRepository;
    private final CommonUtils commonUtils;

    @Transactional
    public void copyResumeToApplication(Member member, Resume resume, JobApplication application) {
        // 1. 사진 복사
        String newPhotoPath = null;
        if (resume.getPhoto() != null) {
            try {
                System.out.println("📸 원본 사진 경로: " + resume.getPhoto());
                newPhotoPath = commonUtils.copyExistingFile(resume.getPhoto());
            } catch (Exception e) {
                throw new RuntimeException("사진 복사 실패", e);
            }
        }

        // 2. 상위 Resume 복사
        JobApplicationResume appResume = JobApplicationResume.builder()
                .jobApplication(application)
                .userId(resume.getUserId())
                .photo(newPhotoPath)
                .name(member.getName())
                .email(member.getEmail())
                .hp(member.getHp())
                .gender(member.getGender())
                .birthDay(member.getBirthDay())
                .zipCode(member.getZipCode())
                .address(member.getAddress())
                .addressDetail(member.getAddressDetail())
                .isExperienced(resume.getIsExperienced())
                .careerSummary(resume.getCareerSummary())
                .coverLetter(resume.getCoverLetter())
                .regDate(LocalDateTime.now())
                .build();

        // 3. 연관 항목 복사
        List<ApplicationCareer> careers = resume.getCareers().stream().map(c ->
                ApplicationCareer.builder()
                        .AppResumeIdx(appResume)
                        .company(c.getCompany())
                        .isWorking(c.getIsWorking())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .contractType(c.getContractType())
                        .role(c.getRole())
                        .position(c.getPosition())
                        .department(c.getDepartment())
                        .description(c.getDescription())
                        .build()
        ).collect(Collectors.toList());

        List<ApplicationEducation> educations = resume.getEducationList().stream().map(e ->
                ApplicationEducation.builder()
                        .AppResumeIdx(appResume)
                        .schoolName(e.getSchoolName())
                        .graduationStatus(e.getGraduationStatus())
                        .startDate(e.getStartDate())
                        .endDate(e.getEndDate())
                        .build()
        ).collect(Collectors.toList());

        List<ApplicationSkill> skills = resume.getSkillsList().stream().map(s ->
                ApplicationSkill.builder()
                        .AppResumeIdx(appResume)
                        .skillName(s.getSkillName())
                        .build()
        ).collect(Collectors.toList());

        List<ApplicationPortfolio> portfolios = resume.getPortfolioList().stream().map(s ->
                ApplicationPortfolio.builder()
                        .AppResumeIdx(appResume)
                        .portfolioUrl(s.getPortfolioUrl())
                        .portfolioContents(s.getPortfolioContents())
                        .build()
        ).collect(Collectors.toList());

        List<ApplicationCertification> certs = resume.getCertificationsList().stream().map(c ->
                ApplicationCertification.builder()
                        .AppResumeIdx(appResume)
                        .certificationName(c.getCertificationName())
                        .build()
        ).collect(Collectors.toList());

        appResume.setCareers(careers);
        appResume.setEducationList(educations);
        appResume.setSkillsList(skills);
        appResume.setPortfolioList(portfolios);
        appResume.setCertificationsList(certs);

        // 4. 저장
        jobApplicationResumeRepository.save(appResume);
    }
}
