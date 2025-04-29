package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityRequestDTO;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityFile;
import JobBridgeKo.com.JobBridge.entity.community.CommunityTag;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import JobBridgeKo.com.JobBridge.repository.CommunityFileRepository;
import JobBridgeKo.com.JobBridge.repository.CommunityRepository;
import JobBridgeKo.com.JobBridge.repository.CommunityTagRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.*;

//공고 관리 + 기업회원 지원자 조회
@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityTagRepository communityTagRepository;
    private final CommunityFileRepository communityFileRepository;
    private final MemberRepository memberRepository;
    private final CommonUtils commonUtils;

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Value("${app.domain}")
    private String domain;

    // 특정 커뮤니티 조회
    public Optional<CommunityDTO> getCommunityByIdx(Long idx) {
        return communityRepository.findByIdx(idx).map(entity -> {
            Member member = memberRepository.findByUserId(entity.getUserId()).orElse(null);
            String userName = member != null ? member.getName() : entity.getUserName();
            CommunityDTO dto = CommunityDTO.from(entity, domain);
            dto.setUserName(userName);
            return dto;
        });
    }


    // 채용 공고 목록 조회 (페이징 적용)
    public Page<CommunityDTO> getAllCommunitys(Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "regDate")
        );

        return communityRepository.findByIsUse(CommunityStatus.IsUse.Y, sortedPageable)
                .map(entity -> {
                    Member member = memberRepository.findByUserId(entity.getUserId()).orElse(null);
                    String userName = member != null ? member.getName() : entity.getUserName();
                    CommunityDTO dto = CommunityDTO.from(entity, domain);
                    dto.setUserName(userName);
                    return dto;
                });
    }


    @Transactional
    @CacheEvict(value = "communityListCache", allEntries = true)
    public void saveCommunity(String userId, CommunityRequestDTO dto) throws IOException {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("등록된 계정 정보가 없습니다."));

        // 썸네일 업로드 처리
        String thumbnailUrl = commonUtils.saveThumbnail(dto.getThumbnail(),"jpg");

        // 게시글 생성
        Community community = Community.builder()
                .userId(userId)
                .userName(member.getName())
                .category(dto.getCategory())
                .title(dto.getTitle())
                .content(dto.getContent())
                .isAnonymous(CommunityStatus.IsAnonymous.valueOf(dto.getIsAnonymous()))
                .isEdited(CommunityStatus.IsEditStatus.N)
                .isUse(CommunityStatus.IsUse.Y)
                .thumbnailUrl(thumbnailUrl)
                .views(0)
                .regDate(LocalDateTime.now())
                .editDate(LocalDateTime.now())
                .build();

        communityRepository.save(community);

        // 태그 저장
        if (dto.getTags() != null && !dto.getTags().isEmpty()) {
            List<CommunityTag> tagEntities = dto.getTags().stream()
                    .map(tag -> CommunityTag.builder()
                            .community(community)
                            .name(tag)
                            .regDate(LocalDateTime.now())
                            .build())
                    .toList();
            communityTagRepository.saveAll(tagEntities);
        }

        // 첨부파일 저장
        if (dto.getAttachments() != null && !dto.getAttachments().isEmpty()) {
            List<CommunityFile> fileEntities = new ArrayList<>();
            for (MultipartFile file : dto.getAttachments()) {
                if (file.isEmpty()) continue;

                Map<String, String> fileInfo = commonUtils.saveUploadedFile(file);

                fileEntities.add(CommunityFile.builder()
                        .community(community)
                        .fileName(fileInfo.get("originalName"))
                        .fileUrl(fileInfo.get("fileUrl"))
                        .fileSize(Long.valueOf(fileInfo.get("fileSize")))
                        .regDate(LocalDateTime.now())
                        .build());
            }
            communityFileRepository.saveAll(fileEntities);
        }
    }

    @Transactional
    @CacheEvict(value = "communityListCache", allEntries = true)
    public void updateCommunity(Long communityIdx, CommunityRequestDTO dto, String myUserId, boolean isAdmin) throws IOException {
        Community community = communityRepository.findById(communityIdx)
                .orElseThrow(() -> new IllegalArgumentException("해당 게시글이 존재하지 않습니다."));

        String userId = isAdmin ? community.getUserId() : myUserId;
        if (!isAdmin && !community.getUserId().equals(userId)) {
            throw new SecurityException("작성자만 수정할 수 있습니다.");
        }

        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("등록된 계정 정보가 없습니다."));

        // 썸네일 교체
        MultipartFile newThumbnail = dto.getThumbnail();
        String newThumbnailUrl = community.getThumbnailUrl();
        if (newThumbnail != null && !newThumbnail.isEmpty()) {
            newThumbnailUrl = commonUtils.saveThumbnail(newThumbnail,"jpg");
        }

        // 기본 정보 수정
        community.setUserId(userId);
        community.setUserName(member.getName());
        community.setTitle(dto.getTitle());
        community.setContent(dto.getContent());
        community.setCategory(dto.getCategory());
        community.setIsAnonymous(CommunityStatus.IsAnonymous.valueOf(dto.getIsAnonymous()));
        community.setThumbnailUrl(newThumbnailUrl);
        community.setIsEdited(CommunityStatus.IsEditStatus.Y);
        community.setEditDate(LocalDateTime.now());

        communityRepository.save(community);

        // 기존 태그 idx 기준 비교: 삭제 후 재등록 대신 일괄 업데이트
        if (dto.getTags() != null) {
            // 기존 태그 모두 삭제 후 재등록이 아닌, 새로 추가된 것만 필터링 가능
            communityTagRepository.deleteByCommunity(community); // 단순화: 복잡도 줄이기

            List<CommunityTag> newTags = dto.getTags().stream()
                    .map(tagName -> CommunityTag.builder()
                            .community(community)
                            .name(tagName)
                            .regDate(LocalDateTime.now())
                            .build())
                    .toList();
            communityTagRepository.saveAll(newTags);
        }

        // 기존 첨부파일 삭제 (existingAttachmentIdxs에 포함되지 않은 것 삭제)
        if (dto.getExistingAttachmentIdxs() != null) {
            List<CommunityFile> existingFiles = communityFileRepository.findByCommunity(community);
            List<CommunityFile> toDelete = existingFiles.stream()
                    .filter(file -> !dto.getExistingAttachmentIdxs().contains(file.getIdx()))
                    .toList();

            if (!toDelete.isEmpty()) {
                // 파일 삭제 유틸 호출
                for (CommunityFile file : toDelete) {
                    commonUtils.deleteFileByUrl(file.getFileUrl());
                }

                // DB 삭제
                communityFileRepository.deleteAllInBatch(toDelete);
            }
        } else {
            // 전체 삭제 (파일 + DB)
            List<CommunityFile> allFiles = communityFileRepository.findByCommunity(community);
            for (CommunityFile file : allFiles) {
                commonUtils.deleteFileByUrl(file.getFileUrl());
            }
            communityFileRepository.deleteByCommunity(community);
        }

        // 새 파일 추가
        if (dto.getAttachments() != null && !dto.getAttachments().isEmpty()) {
            List<CommunityFile> fileEntities = new ArrayList<>();
            for (MultipartFile file : dto.getAttachments()) {
                if (file.isEmpty()) continue;

                Map<String, String> fileInfo = commonUtils.saveUploadedFile(file);

                fileEntities.add(CommunityFile.builder()
                        .community(community)
                        .fileName(fileInfo.get("originalName"))
                        .fileUrl(fileInfo.get("fileUrl"))
                        .fileSize(Long.valueOf(fileInfo.get("fileSize")))
                        .regDate(LocalDateTime.now())
                        .build());
            }
            communityFileRepository.saveAll(fileEntities);
        }
    }


    @Transactional
    public void incrementViews(Long idx) {
        communityRepository.findById(idx).ifPresent(post -> {
            post.setViews(post.getViews() + 1);
        });
    }


    @Transactional
    @CacheEvict(value = "communityListCache", allEntries = true)
    public void deleteCommunity(Long co_idx, String userId, boolean isAdmin) {
        Community community = communityRepository.findById(co_idx)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 존재하지 않습니다."));

        // 작성자 본인 확인
        if (!isAdmin && !community.getUserId().equals(userId)) {
            throw new SecurityException("작성자만 삭제할 수 있습니다.");
        }

        community.setIsUse(CommunityStatus.IsUse.N);
        community.setEditDate(LocalDateTime.now());
        communityRepository.save(community);
    }

    @Cacheable(
            value = "communityListCache",
            key = "#pageable.pageNumber + '-' + #keyword + '-' + #category",
            unless = "#result == null"
    )
    public Page<CommunityDTO> searchCommunity(String keyword, String category, Pageable pageable, CommunityStatus.IsUse status) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "regDate")
        );

        Page<Community> page;

        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCategory = category != null && !category.isBlank();
        boolean hasStatus = status != null;

        if (hasStatus) {
            if (hasKeyword && hasCategory) {
                page = communityRepository.findByIsUseAndCategoryAndTitleContainingIgnoreCase(status, category, keyword, sortedPageable);
            } else if (hasKeyword) {
                page = communityRepository.findByIsUseAndTitleContainingIgnoreCase(status, keyword, sortedPageable);
            } else if (hasCategory) {
                page = communityRepository.findByIsUseAndCategory(status, category, sortedPageable);
            } else {
                page = communityRepository.findByIsUse(status, sortedPageable);
            }
        } else {
            if (hasKeyword && hasCategory) {
                page = communityRepository.findByCategoryAndTitleContainingIgnoreCase(category, keyword, sortedPageable);
            } else if (hasKeyword) {
                page = communityRepository.findByTitleContainingIgnoreCase(keyword, sortedPageable);
            } else if (hasCategory) {
                page = communityRepository.findByCategory(category, sortedPageable);
            } else {
                page = communityRepository.findAll(sortedPageable);
            }
        }

        return page.map(entity -> {
            Member member = memberRepository.findByUserId(entity.getUserId()).orElse(null);
            String userName = member != null ? member.getName() : entity.getUserName();
            CommunityDTO dto = CommunityDTO.from(entity, domain);
            dto.setUserName(userName);
            return dto;
        });
    }


    public Page<CommunityDTO> searchAdminCommunity(String category, String title, String userId, String name, Pageable pageable, String domain) {
        Page<Community> communityPage;

        boolean hasCategory = category != null && !category.isBlank();
        boolean hasTitle = title != null && !title.isBlank();
        boolean hasUserId = userId != null && !userId.isBlank();
        boolean hasName = name != null && !name.isBlank();

        Pageable sortedPageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by("regDate").descending());

        if (hasCategory && hasTitle && hasUserId && hasName) {
            communityPage = communityRepository.findByCategoryAndTitleContainingIgnoreCaseAndUserIdAndUserNameContainingIgnoreCase(
                    category, title, userId, name, sortedPageable);
        } else if (hasCategory && hasTitle) {
            communityPage = communityRepository.findByCategoryAndTitleContainingIgnoreCase(category, title, sortedPageable);
        } else if (hasTitle) {
            communityPage = communityRepository.findByTitleContainingIgnoreCase(title, sortedPageable);
        } else if (hasCategory) {
            communityPage = communityRepository.findByCategory(category, sortedPageable);
        } else {
            communityPage = communityRepository.findAll(sortedPageable);
        }

        return communityPage.map(entity -> {
            Member member = memberRepository.findByUserId(entity.getUserId()).orElse(null);
            String userName = member != null ? member.getName() : entity.getUserName();
            CommunityDTO dto = CommunityDTO.from(entity, domain);
            dto.setUserName(userName);
            return dto;
        });
    }


    @Transactional
    @CacheEvict(value = "communityListCache", allEntries = true)
    public boolean deleteCommunityPostsByIds(List<Long> postIdxList) {
        try {
            // ✅ IN 조건으로 게시글 조회
            List<Community> posts = communityRepository.findByIdxIn(postIdxList);
            if (posts.isEmpty()) return false;

            // ✅ isUse 값을 'N'으로 변경 (논리 삭제)
            for (Community post : posts) {
                post.setIsUse(CommunityStatus.IsUse.N);
            }

            communityRepository.saveAll(posts); // 일괄 저장
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    @CacheEvict(value = "communityListCache", allEntries = true)
    public boolean forceDeleteCommunityPosts(List<Long> postIdxList) {
        try {
            List<Community> posts = communityRepository.findByIdxIn(postIdxList);
            if (posts.isEmpty()) return false;

            for (Community post : posts) {
                // 물리적으로 완전 삭제
                communityRepository.delete(post); // @OneToMany(cascade = ALL, orphanRemoval = true) 덕분에 관련 댓글/파일도 자동 삭제
            }
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    public Page<CommunityDTO> findPostsByUser(String userId, PageRequest pageRequest) {
        Page<Community> postPage = communityRepository.findByUserIdAndIsUse(userId, CommunityStatus.IsUse.Y, pageRequest);

        return postPage.map(entity -> {
            String userName = memberRepository.findByUserId(entity.getUserId())
                    .map(Member::getName)
                    .orElse(entity.getUserName());

            CommunityDTO dto = CommunityDTO.from(entity, domain);
            dto.setUserName(userName); // 최신 이름 설정
            return dto;
        });
    }

}
