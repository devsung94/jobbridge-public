package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.JobApplicationDTO;
import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.entity.JobApplication;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.Resume;
import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.exception.ResourceNotFoundException;
import JobBridgeKo.com.JobBridge.exception.UnauthorizedException;
import JobBridgeKo.com.JobBridge.kafka.NotificationKafkaProducer;
import JobBridgeKo.com.JobBridge.repository.JobApplicationRepository;
import JobBridgeKo.com.JobBridge.repository.JobRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.repository.ResumeRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

// 구직자 지원/취소/조회
@Service
@RequiredArgsConstructor
public class JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final JobRepository jobRepository;
    private final MemberRepository memberRepository;
    private final ResumeRepository resumeRepository;
    private final JobApplicationResumeService jobApplicationResumeService;
    private final NotificationKafkaProducer notificationKafkaProducer;

    @Value("${app.domain}")
    private String domain;

    public Page<JobApplicationDTO> getMyApplications(String userId, Pageable pageable) {
        Page<JobApplication> applications = jobApplicationRepository.findByUserId(userId,pageable);

        return applications.map(app -> JobApplicationDTO.builder()
                .idx(app.getIdx())
                .jobIdx(app.getJob().getIdx()) // 채용공고의 식별자
                .userId(app.getUserId())
                .isUse(app.getIsUse())
                .isRead(app.getIsRead())
                .isStatus(app.getIsStatus())
                .regDate(app.getRegDate())
                .editDate(app.getEditDate())

                .logo(domain + app.getJob().getCompany().getLogo())
                .companyName(app.getJob().getCompany().getCompanyName())
                .title(app.getJob().getTitle())
                .description(app.getJob().getDescription())
                .education(app.getJob().getEducation())
                .address(app.getJob().getCompany().getAddress())
                .addressDetail(app.getJob().getCompany().getAddressDetail())
                .salary(app.getJob().getSalary())
                .preferred(app.getJob().getPreferred())
                .startDate(app.getJob().getStartDate())
                .endDate(app.getJob().getEndDate())

                .statusText(app.getIsUse() == UseStatus.Y ? "지원 완료" : "지원 취소") // 추가
                .build()
        );
    }

    // 채용 공고 지원 기능
    @Transactional
    public boolean applicationForJob(Long jobIdx, String userId) throws ParseException {
        if (userId == null) {
            throw new RuntimeException("로그인이 필요합니다.");
        }

        if (jobApplicationRepository.findByJobIdxAndUserIdAndIsUseAndIsStatusNot(jobIdx, userId, UseStatus.Y, JobApplicationStatus.N).isPresent()) {
            throw new RuntimeException("이미 지원한 공고입니다.");
        }

        Resume resume = resumeRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("이력서가 존재하지 않습니다."));

        Job job = jobRepository.findById(jobIdx)
                .orElseThrow(() -> new RuntimeException("채용 공고가 존재하지 않습니다."));

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");

        Date today = sdf.parse(sdf.format(new Date())); // 오늘 날짜만
        Date endDate = sdf.parse(sdf.format(job.getEndDate())); // 공고 마감일 날짜만

        if (today.after(endDate)) {
            throw new RuntimeException("마감된 공고입니다. 지원할 수 없습니다.");
        }

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("회원 정보가 없습니다."));
        Member writer = memberRepository.findByUserId(job.getUserId())
                .orElseThrow(() -> new RuntimeException("작성자 정보가 없습니다."));

        try {
            JobApplication application = jobApplicationRepository.save(JobApplication.create(job, userId));

            jobApplicationResumeService.copyResumeToApplication(member, resume, application);

            notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                    .senderIdx(member.getIdx())
                    .receiverIdx(writer.getIdx())
                    .message("💠 " + member.getName() + "님이 지원하셨습니다.")
                    .link("/mypage/jobs/" + job.getIdx() + "/applications/" + application.getIdx())
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build());

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("채용 지원 중 오류가 발생했습니다.");
        }
    }


    // 특정 채용 공고에 정상적으로 지원했는지 확인
    public boolean checkIfApplied(Long jobIdx, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
        return jobApplicationRepository.findByJobIdxAndUserIdAndIsUseAndIsStatusNot(jobIdx, userId, UseStatus.Y, JobApplicationStatus.N).isPresent();
    }

    public JobApplication checkAppliedStatus(Long jobIdx, String userId) {
        return jobApplicationRepository
                .findTopByJobIdxAndUserIdOrderByRegDateDesc(jobIdx, userId)
                .orElse(null);
    }


    // 채용 공고 지원 취소
    @Transactional
    public boolean cancelJobApplication(Long jobIdx, String userId) {
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        JobApplication application = jobApplicationRepository.findCancelableApplication(jobIdx, userId)
                .orElseThrow(() -> new ResourceNotFoundException("이미 열람되었거나 면접제의/불합격 처리된 지원은 취소할 수 없습니다."));
        application.setIsUse(UseStatus.N);
        application.setIsStatus(JobApplicationStatus.C);
        application.setCancelDate(LocalDateTime.now());

        try {
            jobApplicationRepository.save(application);

            // Job 객체를 불러와야 JobApplication 생성 가능
            Job job = jobRepository.findById(jobIdx)
                    .orElseThrow(() -> new IllegalArgumentException("채용 공고가 존재하지 않습니다."));

            Member member = memberRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

            Member writer = memberRepository.findByUserId(job.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

            notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                    .senderIdx(member.getIdx())
                    .receiverIdx(writer.getIdx())
                    .message("\uD83D\uDCA0 " + member.getName() + "님이 지원을 취소하셨습니다.")
                    .link("/mypage/jobs/" + job.getIdx() + "/applications")
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build());

            return true;
        } catch (Exception e) {
            throw new RuntimeException("채용 지원 취소 중 오류가 발생했습니다.");
        }
    }

    public boolean isUserApplicant(Long jobIdx, String userId) {
        Optional<JobApplication> app = jobApplicationRepository.findCancelableApplication(jobIdx, userId);
        return app.isPresent();
    }


    @Transactional
    public void markAsRead(Long applicationIdx, String userId) {
        JobApplication application = jobApplicationRepository.findById(applicationIdx)
                .orElseThrow(() -> new IllegalArgumentException("지원 정보를 찾을 수 없습니다."));

        if (application.getIsRead() == UseStatus.Y) return;

        application.setIsRead(UseStatus.Y);
        application.setReadDate(LocalDateTime.now());
        jobApplicationRepository.save(application);


        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Member writer = memberRepository.findByUserId(application.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                .senderIdx(member.getIdx())
                .receiverIdx(writer.getIdx())
                .message("\uD83D\uDCA0 채용 담당자가 지원 이력서를 열람하셨습니다.")
                .link("/mypage/appliedJobs")
                .isRead(UseStatus.N)
                .isUse(UseStatus.Y)
                .build());

    }


    // 채용담당자 -> 지원자 상태 변경
    @Transactional
    public void markAsStatus(Long applicationIdx, String userId, String status) {
        JobApplication application = jobApplicationRepository.findById(applicationIdx)
                .orElseThrow(() -> new IllegalArgumentException("지원 정보를 찾을 수 없습니다."));

        if (application.getIsStatus() == JobApplicationStatus.C
                || application.getIsUse() == UseStatus.N) return;

        application.setIsStatus(JobApplicationStatus.valueOf(status));
        application.setEditDate(LocalDateTime.now());
        jobApplicationRepository.save(application);

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Member writer = memberRepository.findByUserId(application.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        String msg = (status.equals("Y") ? "면접제의 하셨습니다." : "불합격 통지하셨습니다.");
        notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                .senderIdx(member.getIdx())
                .receiverIdx(writer.getIdx())
                .message("\uD83D\uDCA0 채용 담당자가 서류전형을 " + msg)
                .link("/mypage/appliedJobs")
                .isRead(UseStatus.N)
                .isUse(UseStatus.Y)
                .build());

    }
}
