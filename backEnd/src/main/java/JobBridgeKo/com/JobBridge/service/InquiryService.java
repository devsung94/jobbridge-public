package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.InquiryDTO;
import JobBridgeKo.com.JobBridge.dto.NotificationEvent;
import JobBridgeKo.com.JobBridge.entity.Inquiry;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.enums.InquiryType;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.exception.ResourceNotFoundException;
import JobBridgeKo.com.JobBridge.exception.UnauthorizedException;
import JobBridgeKo.com.JobBridge.kafka.NotificationKafkaProducer;
import JobBridgeKo.com.JobBridge.repository.InquiryRepository;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class InquiryService {
    private final InquiryRepository inquiryRepository;
    private final MemberRepository memberRepository;
    private final NotificationKafkaProducer notificationKafkaProducer;
    private final JwtUtil jwtUtil;

    // 목록 조회 (페이징 적용)
    public Page<InquiryDTO> getAllInquirys(Pageable pageable) {
        Page<Inquiry> inquiries = inquiryRepository.findByIsUse(UseStatus.Y, pageable);
        return inquiries.map(inquiry -> {
            String userName = memberRepository.findByUserId(inquiry.getUserId())
                    .map(Member::getName)
                    .orElse("알 수 없음");
            return InquiryDTO.from(inquiry, userName);
        });
    }


    // 관리자용 전체 목록 조회 (삭제 여부 관계없이)
    public Page<InquiryDTO> getAllInquiriesForAdmin(Pageable pageable) {
        return inquiryRepository.findAll(pageable).map(inquiry -> {
            String userName = memberRepository.findByUserId(inquiry.getUserId())
                    .map(Member::getName)
                    .orElse("알 수 없음");
            return InquiryDTO.from(inquiry, userName);
        });
    }

    public Page<InquiryDTO> getAllInquiriesWithAnswers(String title, String userId, String name, Pageable pageable) {
        Pageable sortedPageable = PageRequest.of(
                pageable.getPageNumber(),
                pageable.getPageSize(),
                Sort.by(Sort.Direction.DESC, "regDate")
        );

        // 부모글(문의)만 필터 조건으로 조회
        Page<Inquiry> inquiries = inquiryRepository.findFilteredInquiries(
                InquiryType.inquiry, title, userId, name, sortedPageable
        );

        List<Long> inquiryIdxList = inquiries.getContent().stream()
                .map(Inquiry::getIdx)
                .toList();

        // 해당 문의에 대한 답변 미리 조회
        List<Inquiry> answers = inquiryRepository.findByInquiryTypeAndIsUseAndParentsIdxIn(
                InquiryType.answer, UseStatus.Y, inquiryIdxList
        );

        Map<Long, Inquiry> answerMap = answers.stream()
                .collect(Collectors.toMap(Inquiry::getParentsIdx, Function.identity()));

        return inquiries.map(inquiry -> {
            String userName = memberRepository.findByUserId(inquiry.getUserId())
                    .map(Member::getName)
                    .orElse("알 수 없음");

            InquiryDTO dto = InquiryDTO.from(inquiry, userName);

            if (answerMap.containsKey(inquiry.getIdx())) {
                Inquiry answer = answerMap.get(inquiry.getIdx());
                dto.setAnswerDTO(InquiryDTO.from(answer, "관리자"));
            }

            return dto;
        });
    }


    public Page<InquiryDTO> getUserInquiriesWithAnswers(String userId, Pageable pageable) {
        // 특정 유저의 문의만 조회
        Page<Inquiry> inquiries = inquiryRepository.findByInquiryTypeAndUserIdAndIsUse(InquiryType.inquiry, userId, UseStatus.Y, pageable);

        List<Long> inquiryIdxList = inquiries.getContent().stream()
                .map(Inquiry::getIdx)
                .toList();

        // 해당 문의에 대한 관리자 답변 조회
        List<Inquiry> answers = inquiryRepository.findByInquiryTypeAndIsUseAndParentsIdxIn(
                InquiryType.answer, UseStatus.Y, inquiryIdxList
        );

        Map<Long, Inquiry> answerMap = answers.stream()
                .collect(Collectors.toMap(Inquiry::getParentsIdx, Function.identity()));

        return inquiries.map(inquiry -> {
            InquiryDTO dto = InquiryDTO.from(inquiry, "나"); // 마이페이지에서는 본인이므로 "나"로 표기 가능

            if (answerMap.containsKey(inquiry.getIdx())) {
                Inquiry answer = answerMap.get(inquiry.getIdx());
                dto.setAnswerDTO(InquiryDTO.from(answer, "관리자"));
            }

            return dto;
        });
    }



    // 게시판 조회
    public Optional<InquiryDTO> getInquiryByIdx(Long idx) {
        return inquiryRepository.findByIdx(idx).map(inquiry -> {
            String userName = memberRepository.findByUserId(inquiry.getUserId())
                    .map(Member::getName)
                    .orElse("알 수 없음");
            return InquiryDTO.from(inquiry, userName);
        });
    }


    // 문의 등록
    public Long createInquiry(InquiryDTO inquiryDTO, String token) {
        String userId = jwtUtil.validateToken(token);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        try {
            Inquiry inquiryEntity = new Inquiry(
                    null, userId, InquiryType.inquiry, inquiryDTO.getParentsIdx(),  inquiryDTO.getTitle(), inquiryDTO.getContent(),
                    UseStatus.N, UseStatus.Y, LocalDateTime.now(), null
            );
            Inquiry savedInquiry = inquiryRepository.save(inquiryEntity);

            Member member = memberRepository.findByUserId(userId)
                    .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

            Member writer = memberRepository.findByUserId("admin")
                    .orElseThrow(() -> new IllegalArgumentException("회원 없음"));

            notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                    .senderIdx(member.getIdx())
                    .receiverIdx(writer.getIdx())
                    .message("\uD83D\uDFE2 " + member.getName() + " 님이 문의를 남겼습니다.")
                    .link("/admin/inquiry?query=" + member.getUserId() + "&searchBy=userId&page=1")
                    .isRead(UseStatus.N)
                    .isUse(UseStatus.Y)
                    .build());
            return savedInquiry.getIdx();
        } catch (Exception e) {
            throw new RuntimeException("채용 공고 등록 중 오류가 발생했습니다.");
        }
    }

    // 문의 수정
    public InquiryDTO updateInquiry(Long idx, InquiryDTO inquiryDTO, String token) {
        String userId = jwtUtil.validateToken(token);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        // 사용자 정보 조회
        Member member = memberRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자 정보를 찾을 수 없습니다."));

        Inquiry inquiry = inquiryRepository.findById(idx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 채용 공고를 찾을 수 없습니다."));

        // 작성자 검증
        if (!inquiry.getUserId().equals(userId)) {
            throw new UnauthorizedException("이 공고를 수정할 권한이 없습니다.${userId} " + inquiry.getUserId());
        }

        try {
            inquiry.setTitle(inquiryDTO.getTitle());
            inquiry.setContent(inquiryDTO.getContent());
            inquiry.setEditDate(inquiryDTO.getEditDate());

            Inquiry updatedInquiry = inquiryRepository.save(inquiry);
            return InquiryDTO.from(updatedInquiry,member.getName());
        } catch (Exception e) {
            throw new RuntimeException("채용 공고 수정 중 오류가 발생했습니다.");
        }
    }

    // 문의 삭제
    public Boolean deleteInquiry(Long idx, String token) {
        String userId = jwtUtil.validateToken(token);
        if (userId == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }

        Inquiry inquiry = inquiryRepository.findById(idx)
                .orElseThrow(() -> new ResourceNotFoundException("해당 문의를 찾을 수 없습니다."));

        // 작성자 검증
        if (!inquiry.getUserId().equals(userId)) {
            throw new UnauthorizedException("이 문의를 수정할 권한이 없습니다.");
        }

        try {
            inquiry.setIsUse(UseStatus.N);
            inquiry.setEditDate(LocalDateTime.now()); // 현재 시간 설정
            Inquiry updatedInquiry = inquiryRepository.save(inquiry);
            return true;
        } catch (Exception e) {
            throw new RuntimeException("문의 삭제 중 오류가 발생했습니다.");
        }
    }

    @Transactional
    public boolean deleteInquiryByAdmin(Long idx) {
        try {
            Inquiry inquiry = inquiryRepository.findById(idx)
                    .orElseThrow(() -> new ResourceNotFoundException("해당 문의가 존재하지 않습니다."));
            inquiry.setIsUse(UseStatus.N);
            inquiry.setEditDate(LocalDateTime.now());
            inquiryRepository.save(inquiry);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    @Transactional
    public boolean deleteMultipleInquiriesByAdmin(List<Long> idxs) {
        try {
            List<Inquiry> list = inquiryRepository.findAllById(idxs);
            if (list.isEmpty()) return false;

            for (Inquiry inquiry : list) {
                inquiry.setIsUse(UseStatus.N);
                inquiry.setEditDate(LocalDateTime.now());
            }

            inquiryRepository.saveAll(list);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    @Transactional
    public boolean answerToInquiry(String userId, InquiryDTO dto) {
        try {
            Inquiry answer = new Inquiry(
                    null,
                    "admin", // 관리자 계정
                    InquiryType.answer,
                    dto.getParentsIdx(), // 부모 문의 idx
                    dto.getTitle() != null ? dto.getTitle() : "답변", // 제목은 선택사항
                    dto.getContent(),
                    UseStatus.N,
                    UseStatus.Y,
                    LocalDateTime.now(),
                    null
            );

            inquiryRepository.save(answer);

            // 2. 부모 문의 상태 업데이트 (답변 완료)
            Inquiry parent = inquiryRepository.findByIdx(dto.getParentsIdx())
                    .orElseThrow(() -> new ResourceNotFoundException("부모 문의를 찾을 수 없습니다."));

            if (parent.getInquiryType() == InquiryType.inquiry) {
                parent.setStatus(UseStatus.Y); // 그대로 유지
                parent.setEditDate(LocalDateTime.now());
                // 답변 완료 상태 반영할 필드가 별도로 없을 경우, 예: parent.setStatus("Y") 또는 custom flag가 있으면 여기서 처리
                inquiryRepository.save(parent);


                Member member = memberRepository.findByUserId(userId)
                        .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
                Member writer = memberRepository.findByUserId(parent.getUserId())
                        .orElseThrow(() -> new IllegalArgumentException("회원 없음"));
                notificationKafkaProducer.sendNotification(NotificationEvent.builder()
                        .senderIdx(member.getIdx())
                        .receiverIdx(writer.getIdx())
                        .message("✅ " + member.getName() + " 님이 문의 답변을 남겼습니다.")
                        .link("/mypage/inquiry")
                        .isRead(UseStatus.N)
                        .isUse(UseStatus.Y)
                        .build());
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean updateAnswer(Long idx, InquiryDTO dto) {
        try {
            Inquiry answer = inquiryRepository.findById(idx)
                    .filter(i -> i.getInquiryType() == InquiryType.answer)
                    .orElseThrow(() -> new IllegalArgumentException("답변이 존재하지 않습니다."));

            answer.setContent(dto.getContent());
            answer.setEditDate(LocalDateTime.now());
            inquiryRepository.save(answer);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


    @Transactional
    public boolean updateInquiryByAdmin(Long idx, InquiryDTO dto) {
        try {
            Inquiry inquiry = inquiryRepository.findById(idx)
                    .orElseThrow(() -> new ResourceNotFoundException("해당 문의가 존재하지 않습니다."));

            if (inquiry.getInquiryType() != InquiryType.inquiry) {
                throw new IllegalArgumentException("일반 문의글만 수정 가능합니다.");
            }

            inquiry.setTitle(dto.getTitle());
            inquiry.setContent(dto.getContent());
            inquiry.setEditDate(LocalDateTime.now());

            inquiryRepository.save(inquiry);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean forceDeleteInquiries(List<Long> idxs) {
        try {
            // 1. 부모 문의글 조회
            List<Inquiry> parents = inquiryRepository.findAllById(idxs);
            if (parents.isEmpty()) return false;

            // 2. 해당 부모글의 자식 답변글 조회
            List<Inquiry> children = inquiryRepository.findByInquiryTypeAndParentsIdxIn(InquiryType.answer, idxs);

            // 3. 부모 + 자식 합쳐서 삭제
            List<Inquiry> allToDelete = new ArrayList<>();
            allToDelete.addAll(parents);
            allToDelete.addAll(children);

            inquiryRepository.deleteAll(allToDelete);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
