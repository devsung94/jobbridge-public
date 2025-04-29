package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.dto.resume.*;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.Resume;
import JobBridgeKo.com.JobBridge.entity.resume.*;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.repository.ResumeRepository;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import JobBridgeKo.com.JobBridge.util.ResumeUtils;
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
import java.util.*;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final MemberRepository memberRepository;
    private final ResumeUtils resumeUtils;
    private final CommonUtils commonUtils;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.domain}")
    private String domain;

    @Value("${profile.default-image}")
    private String defaultProfileImage;

    public boolean checkResumeExists(String userId) {
        return resumeRepository.findByUserId(userId).isPresent();
    }

    @Transactional
    public void saveResume(String userId, ResumeRequestDTO dto) throws IOException {
        resumeRepository.findByUserId(userId).ifPresent(resumeRepository::delete);

        String photoUrl = commonUtils.saveThumbnail(dto.getPhoto(),"jpg");

        Resume resume = Resume.builder()
                .userId(userId)
                .photo(photoUrl)
                .isExperienced(dto.getIsExperienced())
                .careerSummary(dto.getCareerSummary())
                .coverLetter(dto.getCoverLetter())
                .regDate(LocalDateTime.now())
                .build();

        resume.setCareers(new ArrayList<>());
        resume.setEducationList(new ArrayList<>());
        resume.setSkillsList(new ArrayList<>());
        resume.setPortfolioList(new ArrayList<>());
        resume.setCertificationsList(new ArrayList<>());

        resumeUtils.updateCareers(resume.getCareers(), dto.getCareers(), resume);
        resumeUtils.updateEducationList(resume.getEducationList(), dto.getEducationList(), resume);
        resumeUtils.updatePortfolioList(resume.getPortfolioList(), dto.getPortfolioList(), resume);
        resumeUtils.updateSkillsList(resume.getSkillsList(), dto.getSkillsList(), resume);
        resumeUtils.updateCertificationsList(resume.getCertificationsList(), dto.getCertificationsList(), resume);

        resumeRepository.save(resume);
    }

    public ResumeResponseDTO getResumeDetail(String userId) {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("등록된 이력서가 없습니다."));
        return convertToResponseDTO(resume);
    }

    public ResumeResponseDTO getResumeDetailByIdx(Long idx) {
        Resume resume = resumeRepository.findById(idx)
                .orElseThrow(() -> new RuntimeException("이력서를 찾을 수 없습니다."));
        return convertToResponseDTO(resume);
    }

    @Transactional
    public void updateResume(String userId, ResumeRequestDTO dto, MultipartFile photo) throws IOException {
        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("이력서가 존재하지 않습니다."));

        resumeUtils.updateCareers(resume.getCareers(), dto.getCareers(), resume);
        resumeUtils.updateEducationList(resume.getEducationList(), dto.getEducationList(), resume);
        resumeUtils.updateSkillsList(resume.getSkillsList(), dto.getSkillsList(), resume);
        resumeUtils.updatePortfolioList(resume.getPortfolioList(), dto.getPortfolioList(), resume);
        resumeUtils.updateCertificationsList(resume.getCertificationsList(), dto.getCertificationsList(), resume);

        if (photo != null && !photo.isEmpty()) {
            resumeUtils.deletePreviousPhotoIfExists(resume.getPhoto(), uploadDir);
            String photoUrl = commonUtils.saveThumbnail(photo,"jpg");
            resume.setPhoto(photoUrl);
        }

        resume.setIsExperienced(dto.getIsExperienced());
        resume.setCareerSummary(dto.getCareerSummary());
        resume.setCoverLetter(dto.getCoverLetter());
        resume.setEditDate(LocalDateTime.now());

        resumeRepository.save(resume);
    }

    private ResumeResponseDTO convertToResponseDTO(Resume resume) {
        // userId로 유저 정보 조회
        Member member = memberRepository.findByUserId(resume.getUserId())
                .orElseThrow(() -> new RuntimeException("유저 정보를 찾을 수 없습니다."));

        String photoUrl = resume.getPhoto() != null
                ? domain + resume.getPhoto()
                : domain + defaultProfileImage;

        return ResumeResponseDTO.builder()
                .idx(resume.getIdx())
                .userId(member.getUserId())
                .name(member.getName())
                .gender(String.valueOf(member.getGender()))
                .birthDay(member.getBirthDay())
                .email(member.getEmail())
                .hp(member.getHp())
                .zipCode(member.getZipCode())
                .address(member.getAddress())
                .addressDetail(member.getAddressDetail())
                .photo(photoUrl)
                .isExperienced(resume.getIsExperienced())
                .careerSummary(resume.getCareerSummary())
                .coverLetter(resume.getCoverLetter())
                .careers(resume.getCareers().stream().map(c -> CareerDTO.builder()
                        .idx(c.getIdx())
                        .company(c.getCompany())
                        .isWorking(c.getIsWorking())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .contractType(c.getContractType())
                        .role(c.getRole())
                        .position(c.getPosition())
                        .department(c.getDepartment())
                        .description(c.getDescription())
                        .build()).toList())
                .educationList(resume.getEducationList().stream()
                        .map(e -> new EducationDTO(e.getIdx(), e.getSchoolName(), e.getGraduationStatus(), e.getStartDate(), e.getEndDate())).toList())
                .skillsList(resume.getSkillsList().stream()
                        .map(s -> new SkillDTO(s.getIdx(), s.getSkillName())).toList())
                .portfolioList(resume.getPortfolioList().stream()
                        .map(s -> new PortfolioDTO(s.getIdx(), s.getPortfolioUrl(), s.getPortfolioContents())).toList())
                .certificationsList(resume.getCertificationsList().stream()
                        .map(c -> new CertificationDTO(c.getIdx(), c.getCertificationName())).toList())

                .build();
    }



    public ResumeResponseDTO getResumeByIdx(Long resumeIdx) {
        Resume resume = resumeRepository.findById(resumeIdx)
                .orElseThrow(() -> new IllegalArgumentException("이력서가 존재하지 않습니다."));

        return convertToResponseDTO(resume);
    }

    public MemberDTO getUserProfileByResumeIdx(Long resumeIdx) {
        Resume resume = resumeRepository.findById(resumeIdx)
                .orElseThrow(() -> new IllegalArgumentException("이력서가 존재하지 않습니다."));
        Member member = resume.getMember(); // resume에 @OneToOne으로 연관된 member
        if (member == null) throw new IllegalArgumentException("회원 정보가 없습니다.");

        return MemberDTO.from(member);
    }
}
