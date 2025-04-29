package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.AdminVisitorDTO;
import JobBridgeKo.com.JobBridge.entity.Visitor;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.repository.VisitorRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class AdminVisitorService {

    private final VisitorRepository visitorRepository;

    public Page<AdminVisitorDTO> getVisitors(Pageable pageable, String ipAddress, String path) {
        Page<Visitor> visitorPage;

        if (ipAddress != null && !ipAddress.isBlank()) {
            visitorPage = visitorRepository.findByIpAddressContainingOrderByIdxDesc(ipAddress, pageable);
        } else if (path != null && !path.isBlank()) {
            visitorPage = visitorRepository.findByPathContainingOrderByIdxDesc(path, pageable);
        } else {
            visitorPage = visitorRepository.findAllByOrderByIdxDesc(pageable);
        }

        List<AdminVisitorDTO> visitorDTOs = visitorPage.stream()
                .map(AdminVisitorDTO::fromEntity)
                .collect(Collectors.toList());

        return new PageImpl<>(visitorDTOs, pageable, visitorPage.getTotalElements());
    }

    @Transactional
    public void deleteVisitor(Long idx) {
        visitorRepository.deleteById(idx);
    }

    @Transactional
    public void deleteVisitors(List<Long> idxs) {
        visitorRepository.deleteAllByIdInBatch(idxs);
    }

    @Transactional
    public boolean forceDeleteVisitorPosts(List<Long> postIdxList) {
        try {
            List<Visitor> posts = visitorRepository.findByIdxIn(postIdxList);
            if (posts.isEmpty()) return false;

            for (Visitor post : posts) {
                // 물리적으로 완전 삭제
                visitorRepository.delete(post); // @OneToMany(cascade = ALL, orphanRemoval = true) 덕분에 관련 댓글/파일도 자동 삭제
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
