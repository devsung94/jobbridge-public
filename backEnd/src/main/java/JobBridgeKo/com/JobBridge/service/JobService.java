package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.ResumeSummaryDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.dto.resume.*;
import JobBridgeKo.com.JobBridge.entity.*;
import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.enums.UserStatus;
import JobBridgeKo.com.JobBridge.exception.UnauthorizedException;
import JobBridgeKo.com.JobBridge.exception.ResourceNotFoundException;
import JobBridgeKo.com.JobBridge.repository.JobApplicationResumeRepository;
import JobBridgeKo.com.JobBridge.repository.JobRepository;
import JobBridgeKo.com.JobBridge.repository.ResumeRepository;
import JobBridgeKo.com.JobBridge.repository.JobApplicationRepository;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageImpl;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


//공고 관리 + 기업회원 지원자 조회
@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class JobService {
    private final JobRepository jobRepository;
    private final JobApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final CompanyService companyService;
    private final JobApplicationResumeRepository jobApplicationResumeRepository;
    private final CommonUtils commonUtils;

    @Value("${app.domain}")
    private String domain;
    @Value("${profile.default-image}")
    private String defaultProfileImage;

    // 특정 채용 공고 조회
    public Optional<JobDTO> getJobByIdx(Long idx) {
        return jobRepository.findByIdx(idx).map(job -> JobDTO.from(job, domain,0));
    }

    // 채용 공고 목록 조회 (페이징 적용)
    @Cacheable(
            value = "jobListCache",
            key = "#pageable.pageNumber + '-' + #city + '-' + #keyword",
            unless = "#result == null"
    )
    public Page<JobDTO> getAllJobs(String city, String keyword, Pageable pageable, UseStatus status) {
        Date now = new Date();
        Page<Job> jobPage = jobRepository.searchJobs(now, status, city, keyword, pageable);
        return jobPage.map(job -> JobDTO.from(job, domain, 0));
    }

    // 채용 담당자 공고 목록 조회 (페이징 적용)
    public Page<JobDTO> getJobsByRecruiter(String userId, Pageable pageable) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        Page<Job> jobPage = jobRepository.findByUserId(UseStatus.Y, userId, pageable);
        return jobPage.map(job -> {
            int applicantCount = applicationRepository.countByJob_Idx(job.getIdx());
            return JobDTO.from(job, domain, applicantCount);
        });
    }

    @Transactional
    public Page<ApplicationResumeDTO> getJobApplicationResumes(Long jobIdx, String userId, Boolean isAdmin, Pageable pageable) {
        Job job = jobRepository.findById(jobIdx)
                .orElseThrow(() -> new IllegalArgumentException("공고가 존재하지 않습니다."));

        System.out.println("job.getUserId() : " + job.getUserId() + " / userID : " + userId);

        if (!job.getUserId().equals(userId) && !isAdmin) {
            throw new SecurityException("해당 공고의 작성자가 아닙니다.");
        }

        // 1. 페이징으로 지원자만 가져옴
        Page<JobApplication> applications = applicationRepository.findByJob_Idx(jobIdx, pageable);

        // 2. application 들에 해당하는 resume 일괄 조회
        List<JobApplicationResume> resumes = jobApplicationResumeRepository.findByJobApplicationIn(applications.getContent());

        // 3. 매핑
        Map<Long, JobApplicationResume> resumeMap = resumes.stream()
                .collect(Collectors.toMap(r -> r.getJobApplication().getIdx(), r -> r));

        // 4. DTO 변환
        List<ApplicationResumeDTO> dtoList = applications.getContent().stream()
                .map(app -> {
                    JobApplicationResume resume = resumeMap.get(app.getIdx());
                    if (resume == null) return null;

                    return ApplicationResumeDTO.builder()
                            .idx(app.getIdx())
                            .userId(resume.getUserId())
                            .photo(domain + resume.getPhoto())
                            .name(resume.getName())
                            .email(resume.getEmail())
                            .hp(resume.getHp())
                            .gender(resume.getGender())
                            .birthDay(resume.getBirthDay())
                            .zipCode(resume.getZipCode())
                            .address(resume.getAddress())
                            .addressDetail(resume.getAddressDetail())
                            .isExperienced(resume.getIsExperienced())
                            .careerSummary(resume.getCareerSummary())
                            .coverLetter(resume.getCoverLetter())
                            .isUse(app.getIsUse())
                            .isRead(app.getIsRead())
                            .isStatus(app.getIsStatus())
                            .regDate(app.getRegDate())
                            .careers(resume.getCareers().stream().map(c -> ApplicationCareerDTO.builder()
                                    .company(c.getCompany())
                                    .startDate(c.getStartDate())
                                    .endDate(c.getEndDate())
                                    .contractType(c.getContractType())
                                    .role(c.getRole())
                                    .position(c.getPosition())
                                    .department(c.getDepartment())
                                    .description(c.getDescription())
                                    .isWorking(c.getIsWorking())
                                    .build()).toList())
                            .educationList(resume.getEducationList().stream().map(e -> ApplicationEducationDTO.builder()
                                    .schoolName(e.getSchoolName())
                                    .graduationStatus(e.getGraduationStatus())
                                    .startDate(e.getStartDate())
                                    .endDate(e.getEndDate())
                                    .build()).toList())
                            .skillsList(resume.getSkillsList().stream().map(s -> ApplicationSkillDTO.builder()
                                    .skillName(s.getSkillName())
                                    .build()).toList())
                            .portfolioList(resume.getPortfolioList().stream().map(s -> ApplicationPortfolioDTO.builder()
                                    .portfolioUrl(s.getPortfolioUrl())
                                    .portfolioContents(s.getPortfolioContents())
                                    .build()).toList())
                            .certificationsList(resume.getCertificationsList().stream().map(c -> ApplicationCertificationDTO.builder()
                                    .certificationName(c.getCertificationName())
                                    .build()).toList())
                            .build();
                })
                .filter(Objects::nonNull)
                .toList();

        return new PageImpl<>(dtoList, pageable, applications.getTotalElements());
    }



    @Transactional
    public ApplicationResumeDTO getApplicationResume(Long applicationIdx, String userId, Boolean isAdmin) {

        // 지원 내역 하나 조회
        JobApplication application = applicationRepository.findById(applicationIdx)
                .orElseThrow(() -> new IllegalArgumentException("지원 내역이 존재하지 않습니다."));

        // 해당 지원서의 공고 조회
        Job job = jobRepository.findById(application.getJob().getIdx())
                .orElseThrow(() -> new IllegalArgumentException("공고가 존재하지 않습니다."));

        // 작성자인지 확인
        if (!job.getUserId().equals(userId) && !isAdmin) {
            throw new SecurityException("해당 공고의 작성자가 아닙니다.");
        }

        // 지원자의 이력서 조회
        JobApplicationResume resume = jobApplicationResumeRepository.findByJobApplication(application)
                .orElseThrow(() -> new IllegalArgumentException("이력서가 존재하지 않습니다."));

        // 응답 DTO로 변환 후 반환
        return ApplicationResumeDTO.builder()
                .idx(resume.getIdx())
                .photo(domain + resume.getPhoto()) // 도메인 포함한 전체 경로

                .userId(resume.getUserId())
                .name(resume.getName())
                .email(resume.getEmail())
                .hp(resume.getHp())
                .gender(resume.getGender())
                .birthDay(resume.getBirthDay())
                .zipCode(resume.getZipCode())
                .address(resume.getAddress())
                .addressDetail(resume.getAddressDetail())

                .isExperienced(resume.getIsExperienced())
                .careerSummary(resume.getCareerSummary())
                .coverLetter(resume.getCoverLetter())

                .isUse(application.getIsUse())
                .isRead(application.getIsRead())
                .isStatus(application.getIsStatus())
                .regDate(application.getRegDate())

                .careers(resume.getCareers().stream().map(c -> ApplicationCareerDTO.builder()
                        .idx(c.getIdx())
                        .isWorking(c.getIsWorking())
                        .company(c.getCompany())
                        .startDate(c.getStartDate())
                        .endDate(c.getEndDate())
                        .contractType(c.getContractType())
                        .role(c.getRole())
                        .position(c.getPosition())
                        .department(c.getDepartment())
                        .description(c.getDescription())
                        .build()).toList())
                .educationList(resume.getEducationList().stream()
                        .map(e -> new ApplicationEducationDTO(e.getIdx(), e.getSchoolName(),e.getGraduationStatus(),e.getStartDate(),e.getEndDate())).toList())
                .skillsList(resume.getSkillsList().stream()
                        .map(s -> new ApplicationSkillDTO(s.getIdx(), s.getSkillName())).toList())
                .portfolioList(resume.getPortfolioList().stream()
                        .map(s -> new ApplicationPortfolioDTO(s.getIdx(), s.getPortfolioUrl(), s.getPortfolioContents())).toList())
                .certificationsList(resume.getCertificationsList().stream()
                        .map(c -> new ApplicationCertificationDTO(c.getIdx(), c.getCertificationName())).toList())
                .build();
    }

    public CompanyResponseDTO getCompanyInfoByJobIdx(Long jobIdx) {
        // 공고 조회
        Job job = jobRepository.findById(jobIdx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 채용 공고가 존재하지 않습니다."));

        // userId 추출
        String userId = job.getUserId();

        // 회사 정보 가져오기
        return companyService.getCompanyDetail(userId);
    }


    // 채용 공고 등록
    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public Long createJob(JobDTO jobDTO, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        try {
            Job jobEntity = Job.create(userId, jobDTO); // 리팩토링 적용
            Job savedJob = jobRepository.save(jobEntity);
            return savedJob.getIdx();
        } catch (Exception e) {
            throw new RuntimeException("채용 공고 등록 중 오류가 발생했습니다.");
        }
    }

    // 채용 공고 수정
    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public JobDTO updateJob(Long idx, JobDTO jobDTO, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        Job job = jobRepository.findById(idx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 채용 공고를 찾을 수 없습니다."));

        // 작성자 검증
        if (!job.getUserId().equals(userId)) {
            throw new UnauthorizedException("이 공고를 수정할 권한이 없습니다.");
        }

        try {
            job.setTitle(jobDTO.getTitle());
            job.setDescription(jobDTO.getDescription());
            job.setExperience(jobDTO.getExperience());
            job.setEducation(jobDTO.getEducation());
            job.setSalary(jobDTO.getSalary());
            job.setPreferred(jobDTO.getPreferred());
            job.setStartDate(jobDTO.getStartDate());
            job.setEndDate(jobDTO.getEndDate());

            Job updatedJob = jobRepository.save(job);
            return JobDTO.from(updatedJob,domain,0);
        } catch (Exception e) {
            throw new RuntimeException("채용 공고 수정 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public void deleteJob(Long idx, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        Job job = jobRepository.findById(idx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 채용 공고를 찾을 수 없습니다."));

        if (!job.getUserId().equals(userId)) {
            throw new UnauthorizedException("이 공고를 삭제할 권한이 없습니다.");
        }

        job.setIsUse(UseStatus.N); // 소프트 삭제 처리
        jobRepository.save(job);
    }


    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public boolean deleteJobsByIds(List<Long> jobIdxList) {
        try {
            List<Job> jobs = jobRepository.findAllById(jobIdxList);
            if (jobs.isEmpty()) return false;
            for (Job job : jobs) {
                job.setIsUse(UseStatus.N);
                job.setEditDate(LocalDateTime.now());
            }
            jobRepository.saveAll(jobs); // batch 저장 처리
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public boolean deleteJobByAdmin(Long idx) {
        try {
            Job job = jobRepository.findById(idx)
                    .orElseThrow(() -> new ResourceNotFoundException("해당 회원이 존재하지 않습니다."));
            job.setIsUse(UseStatus.N);
            job.setEditDate(LocalDateTime.now());
            jobRepository.save(job);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public void updateJobByAdmin(Long idx, JobDTO jobDTO) {
        Job job = jobRepository.findById(idx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 채용 공고를 찾을 수 없습니다."));

        job.setTitle(jobDTO.getTitle());
        job.setDescription(jobDTO.getDescription());
        job.setExperience(jobDTO.getExperience());
        job.setEducation(jobDTO.getEducation());
        job.setSalary(jobDTO.getSalary());
        job.setPreferred(jobDTO.getPreferred());
        job.setStartDate(jobDTO.getStartDate());
        job.setEndDate(jobDTO.getEndDate());
        job.setEditDate(LocalDateTime.now());

        jobRepository.save(job);
    }

    // JobService.java (추가 메서드)
    public Page<JobDTO> getAllJobsWithApplicants(String companyName, String title, Pageable pageable) {
        Page<Job> jobs;

        if (companyName != null && title != null) {
            jobs = jobRepository.findByCompany_CompanyNameContainingIgnoreCaseAndTitleContainingIgnoreCase(companyName, title, pageable);
        } else if (companyName != null) {
            jobs = jobRepository.findByCompany_CompanyNameContainingIgnoreCase(companyName, pageable);
        } else if (title != null) {
            jobs = jobRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else {
            jobs = jobRepository.findAll(pageable);
        }

        return jobs.map(job -> {
            int applicantCount = applicationRepository.countByJob(job);
            return JobDTO.from(job, domain, applicantCount);
        });
    }

    @Transactional
    public List<ResumeSummaryDTO> getApplicantsForAdmin(Long jobIdx) {
        Job job = jobRepository.findById(jobIdx)
                .orElseThrow(() -> new ResourceNotFoundException("공고를 찾을 수 없습니다."));

        List<JobApplication> applications = applicationRepository.findAllByJob_Idx(jobIdx);

        return applications.stream().map(app -> {
            Resume resume = resumeRepository.findByUserId(app.getUserId()).orElse(null);
            if (resume == null) return null;

            Member member = resume.getMember();
            if (member == null) return null;

            String photoUrl = (resume.getPhoto() != null) ? domain + resume.getPhoto() : domain + defaultProfileImage;

            return ResumeSummaryDTO.builder()
                    .idx(app.getIdx())
                    .resumeIdx(resume.getIdx())
                    .userId(member.getUserId())
                    .userName(member.getName())
                    .photo(photoUrl)
                    .isExperienced(resume.getIsExperienced())
                    .careerSummary(resume.getCareerSummary())
                    .birthDay(member.getBirthDay())
                    .isUse(app.getIsUse())
                    .build();
        }).filter(Objects::nonNull).toList();
    }

    @Transactional
    public void updateApplicationStatus(Long applicationIdx, String isStatus) {
        JobApplication application = applicationRepository.findById(applicationIdx)
                .orElseThrow(() -> new RuntimeException("지원 정보가 없습니다."));
        application.setIsStatus(JobApplicationStatus.valueOf(isStatus));
    }

    @Transactional
    @CacheEvict(value = "jobListCache", allEntries = true)
    public boolean forceDeleteJobsByIds(List<Long> jobIdxList) {
        try {
            List<Job> jobs = jobRepository.findAllById(jobIdxList);
            if (jobs.isEmpty()) return false;

            for (Job job : jobs) {
                // 1. 지원 내역 삭제
                List<JobApplication> applications = applicationRepository.findAllByJob_Idx(job.getIdx());

                for (JobApplication app : applications) {
                    // 지원자 이력서 삭제
                    jobApplicationResumeRepository.findByJobApplication(app)
                            .ifPresent(resume -> {
                                // 이미지 파일 경로 삭제 (도메인 + 파일명)
                                if (resume.getPhoto() != null) {
                                    commonUtils.deleteFileByUrl(resume.getPhoto());
                                }
                                jobApplicationResumeRepository.delete(resume);
                            });

                    applicationRepository.delete(app);
                }

                // 2. 공고 삭제
                jobRepository.delete(job);
            }

            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
