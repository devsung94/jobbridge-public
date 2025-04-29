package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import JobBridgeKo.com.JobBridge.dto.community.CommentDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityComment;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.kafka.NotificationKafkaProducer;
import JobBridgeKo.com.JobBridge.repository.CommunityCommentRepository;
import JobBridgeKo.com.JobBridge.repository.CommunityRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

//공고 관리 + 기업회원 지원자 조회
@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class CommunityCommentService {
    private final CommunityCommentRepository communityCommentRepository;
    private final CommunityRepository communityRepository; // 추가 필요
    private final MemberRepository memberRepository;
    private final NotificationKafkaProducer notificationKafkaProducer;
    @Value("app.domain")
    private String domain;

    public Page<CommentDTO> getComments(Long coIdx, PageRequest pageRequest) {
        Page<CommunityComment> commentPage = communityCommentRepository
                .findByCommunityIdxAndParentIsNullOrderByRegDateDesc(coIdx, pageRequest);

        return commentPage.map(parent -> {
            CommentDTO parentDTO = CommunityComment.toDTO(parent);

            // 이름 최신화
            memberRepository.findByUserId(parent.getUserId()).ifPresent(member -> parentDTO.setUserName(member.getName()));

            // 자식 댓글 조회
            List<CommunityComment> children = communityCommentRepository
                    .findByParentOrderByRegDateAsc(parent);

            List<CommentDTO> replyDTOs = children.stream()
                    .map(reply -> {
                        CommentDTO dto = CommunityComment.toDTO(reply);
                        memberRepository.findByUserId(reply.getUserId()).ifPresent(member -> dto.setUserName(member.getName()));
                        return dto;
                    })
                    .collect(Collectors.toList());

            parentDTO.setReplies(replyDTOs);
            return parentDTO;
        });
    }


    public Page<CommentDTO> findCommentedPostsByUser(String userId, Pageable pageable) {
        Page<Community> postPage = communityCommentRepository.findDistinctCommentedCommunitiesByUserId(
                userId,
                CommunityStatus.IsUse.Y,
                CommunityStatus.IsUse.Y,
                pageable
        );

        return postPage.map(post ->
                CommentDTO.builder()
                        .communityIdx(post.getIdx())
                        .content(post.getContent())
                        .regDate(post.getRegDate())
                        .isUse(post.getIsUse())
                        .userId(post.getUserId())
                        .userName(
                                memberRepository.findByUserId(post.getUserId())
                                        .map(m -> m.getName())
                                        .orElse("알 수 없음")
                        )
                        .build()
        );
    }

    @Transactional
    public CommentDTO saveComment(String userId, CommentDTO dto) {
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

        Community community = communityRepository.findById(dto.getCommunityIdx())
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));

        Member communityWriter = memberRepository.findByUserId(community.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("게시글 작성자 없음"));

        CommunityComment parentComment = null;
        Member parentWriter = null;

        if (dto.getParentId() != null) {
            parentComment = communityCommentRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글 없음"));
            parentWriter = memberRepository.findByUserId(parentComment.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("부모 댓글 작성자 없음"));
        }

        CommunityComment comment = CommunityComment.builder()
                .userId(userId)
                .userName(member.getName())
                .content(dto.getContent())
                .community(community)
                .parent(parentComment)
                .isUse(CommunityStatus.IsUse.Y)
                .regDate(LocalDateTime.now())
                .build();

        CommunityComment saved = communityCommentRepository.save(comment);

        Set<Long> notifiedMemberIdxSet = new HashSet<>();

        // 1. 게시글 작성자에게 알림
        if (!communityWriter.getIdx().equals(member.getIdx())) {
            notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                    .senderIdx(member.getIdx())
                    .receiverIdx(communityWriter.getIdx())
                    .message("🔥 " + member.getName() + "님이 게시글에 댓글을 남겼습니다.")
                    .link("/community/" + community.getIdx())
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build());
            notifiedMemberIdxSet.add(communityWriter.getIdx());
        }

        // 2. 부모 댓글 작성자에게 알림
        if (parentWriter != null && !parentWriter.getIdx().equals(member.getIdx()) && !notifiedMemberIdxSet.contains(parentWriter.getIdx())) {
            notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                    .senderIdx(member.getIdx())
                    .receiverIdx(parentWriter.getIdx())
                    .message("💬 " + member.getName() + "님이 당신의 댓글에 답글을 남겼습니다.")
                    .link("/community/" + community.getIdx())
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build());
            notifiedMemberIdxSet.add(parentWriter.getIdx());
        }

        // 3. 대댓글 대상 전원 알림 (부모 댓글에 달린 모든 대댓글 + 부모 댓글 포함)
        if (parentComment != null) {
            List<String> userIds = communityCommentRepository.findDistinctUserIdByParentIdOrId(parentComment.getIdx());

            for (String uid : userIds) {
                if (uid.equals(userId)) continue; // 본인 제외
                Member receiver = memberRepository.findByUserId(uid).orElse(null);
                if (receiver != null && !notifiedMemberIdxSet.contains(receiver.getIdx())) {
                    notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                            .senderIdx(member.getIdx())
                            .receiverIdx(receiver.getIdx())
                            .message("💬 " + member.getName() + "님이 대댓글을 남겼습니다.")
                            .link("/community/" + community.getIdx())
                            .isRead(UseStatus.N)
                            .isUse(UseStatus.Y)
                            .build());
                    notifiedMemberIdxSet.add(receiver.getIdx());
                }
            }
        }

        community.setCommentsCount(community.getCommentsCount() + 1);
        return CommunityComment.toDTO(saved);
    }




    @Transactional
    public CommentDTO updateComment(Long commentIdx, String userId, String newContent) {
        CommunityComment comment = communityCommentRepository.findById(commentIdx)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        if (!comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("본인의 댓글만 수정할 수 있습니다.");
        }

        comment.setContent(newContent);
        comment.setEditDate(LocalDateTime.now());

        return CommunityComment.toDTO(comment);
    }


    @Transactional
    public void deleteCommentByUser(Long commentIdx, String userId, boolean isAdmin) {
        CommunityComment comment = communityCommentRepository.findById(commentIdx)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 존재하지 않습니다."));

        if (!isAdmin && !comment.getUserId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 삭제할 수 있습니다.");
        }

        comment.setIsUse(CommunityStatus.IsUse.N);
        comment.setEditDate(LocalDateTime.now());

        Community community = comment.getCommunity();
        community.setCommentsCount(Math.max(0, community.getCommentsCount() - 1));
        communityRepository.save(community);
    }

    public Page<CommunityDTO> findCommentedPostDTOsByUser(String userId, PageRequest pageRequest) {
        Page<Object[]> resultPage = communityCommentRepository.findLatestCommentedCommunitiesWithCommentIdByUserId(
                userId,
                CommunityStatus.IsUse.Y,
                CommunityStatus.IsUse.Y,
                pageRequest
        );

        return resultPage.map(row -> {
            Community community = (Community) row[0];
            Long latestCommentId = (Long) row[1];

            String userName = memberRepository.findByUserId(community.getUserId())
                    .map(Member::getName)
                    .orElse(community.getUserName());

            CommunityDTO dto = CommunityDTO.from(community, domain);
            dto.setUserName(userName);
            dto.setLatestCommentId(latestCommentId); // ← 이 필드는 DTO에 있어야 함
            return dto;
        });
    }


    @Transactional
    public int findPageOfComment(Long communityIdx, Long commentIdx, int size) {
        CommunityComment target = communityCommentRepository.findById(commentIdx)
                .orElseThrow(() -> new IllegalArgumentException("댓글을 찾을 수 없습니다."));

        Long baseIdx = target.getParent() != null ? target.getParent().getIdx() : commentIdx;

        // ✅ 최신순으로 정렬된 댓글 리스트
        List<Long> topLevelCommentIds = communityCommentRepository
                .findTopLevelCommentIdxsByCommunityIdxOrderByRegDateDesc(communityIdx);

        int index = topLevelCommentIds.indexOf(baseIdx);
        if (index == -1) {
            throw new IllegalArgumentException("댓글(또는 부모 댓글)을 찾을 수 없습니다.");
        }

        // ✅ 최신순 정렬이므로 index 그대로 페이지 계산하면 됨
        return (index / size) + 1;
    }



}
