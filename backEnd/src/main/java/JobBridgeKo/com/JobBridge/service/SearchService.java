package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.repository.CommunityRepository;
import JobBridgeKo.com.JobBridge.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final JobRepository jobRepository;
    private final CommunityRepository communityRepository;
    @Value("${app.domain}")
    private String domain;

    public Page<JobDTO> searchJobs(String keyword, Pageable pageable) {
        Page<Job> jobPage = jobRepository.searchJobByKeywordWithCompanyName(new Date(), UseStatus.Y, keyword, pageable);
        return jobPage.map(job -> JobDTO.from(job, domain, 0));
    }

    public Page<CommunityDTO> searchCommunity(String keyword, Pageable pageable) {
        Page<Community> communityPage = communityRepository.findByIsUseAndTitleContainingIgnoreCase(CommunityStatus.IsUse.Y, keyword, pageable);
        return communityPage.map(post -> CommunityDTO.from(post, domain));
    }
}
