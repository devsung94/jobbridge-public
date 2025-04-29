package JobBridgeKo.com.JobBridge.repository;

import JobBridgeKo.com.JobBridge.entity.JobApplication;
import JobBridgeKo.com.JobBridge.entity.JobApplicationResume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface JobApplicationResumeRepository extends JpaRepository<JobApplicationResume, Long> {

    // 기존 단일 조회
    Optional<JobApplicationResume> findByJobApplication(JobApplication application);

    // ✅ JobApplication 리스트로 일괄 조회 (추가)
    List<JobApplicationResume> findByJobApplicationIn(List<JobApplication> applications);
}
