package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.dto.MemberRegisterRequestDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.Inquiry;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.Resume;
import JobBridgeKo.com.JobBridge.enums.CommunityStatus;
import JobBridgeKo.com.JobBridge.enums.GenderType;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import JobBridgeKo.com.JobBridge.enums.UserStatus;
import JobBridgeKo.com.JobBridge.exception.ResourceNotFoundException;
import JobBridgeKo.com.JobBridge.repository.*;
import JobBridgeKo.com.JobBridge.util.CommonUtils;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class MemberService {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    private final CommunityRepository communityRepository;
    private final CommunityCommentRepository communityCommentRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final InquiryRepository inquiryRepository;
    private final ResumeRepository resumeRepository;
    private final CommonUtils commonUtils;

    // 회원 가입
    public Map<String, String> registerUser(MemberRegisterRequestDTO dto) {
        String password = dto.getPassword();
        String rePassword = dto.getRePassword();

        if (!password.equals(rePassword)) {
            return Map.of("result", "N", "message", "비밀번호가 서로 다릅니다.");
        }

        if (dto.getGender() == null || (!dto.getGender().equals(GenderType.M) && !dto.getGender().equals(GenderType.W))) {
            return Map.of("result", "N", "message", "성별을 올바르게 선택해주세요.");
        }

        // 대소문자 구분없이 똑같은건 전부 방지
        if (memberRepository.findByUserIdIgnoreCase(dto.getUserId()).isPresent()) {
            return Map.of("result", "N", "message", "이미 등록된 아이디가 있습니다.");
        }

        if (memberRepository.findByEmail(dto.getEmail()).isPresent()) {
            return Map.of("result", "N", "message", "이미 등록된 이메일이 있습니다.");
        }

        if (!dto.isTermsAgreed() || !dto.isPrivacyAgreed()) {
            return Map.of("result", "N", "message", "서비스 이용약관 및 개인정보처리방침에 모두 동의해야 합니다.");
        }

        String encodedPassword = passwordEncoder.encode(password);

        Member newMember = Member.builder()
                .role(dto.getRole())
                .userId(dto.getUserId())
                .password(encodedPassword)
                .gender(dto.getGender())
                .birthDay(dto.getBirthDay())
                .name(dto.getName())
                .email(dto.getEmail())
                .hp(dto.getHp())
                .zipCode(dto.getZipCode())
                .address(dto.getAddress())
                .addressDetail(dto.getAddressDetail())
                .isUse(UserStatus.Y)
                .termsAgreed(dto.isTermsAgreed())
                .privacyAgreed(dto.isPrivacyAgreed())
                .agreedDate(LocalDateTime.now()) // 동의 시각
                .regDate(LocalDateTime.now())
                .build();

        memberRepository.save(newMember);

        return Map.of("result", "Y", "message", "회원가입 등록이 완료되었습니다.");
    }

    // 로그인 처리
    public Map<String, String> loginUser(String userId, String password, JwtUtil jwtUtil) {
        Optional<Member> user = memberRepository.findByUserId(userId);

        if (user.isEmpty()) {
            return Map.of("result", "N", "message", "등록된 계정 정보가 없습니다.");
        }
        if (!passwordEncoder.matches(password, user.get().getPassword())) {
            return Map.of("result", "N", "message", "비밀번호가 틀렸습니다.");
        }

        UserStatus userStatus = user.get().getIsUse();
        if (userStatus != UserStatus.Y) {
            String message = switch (userStatus) {
                case T -> "현재 탈퇴된 계정입니다.";
                case B -> "현재 차단된 계정입니다.";
                case N -> "현재 사용 불가 계정입니다.";
                default -> "알 수 없는 상태의 계정입니다.";
            };
            return Map.of("result", "N", "message", message);
        }

        return Map.of("result", "Y", "token", jwtUtil.generateToken(
                user.get().getIdx(),
                userId,
                user.get().getEmail(),
                user.get().getName(),
                user.get().getRole()));
    }

    @Transactional
    public void updateLoginInfo(String userId, String ipAddress) {
        memberRepository.findByUserId(userId).ifPresent(member -> {
            member.setIp(ipAddress);
            member.setLastLogin(LocalDateTime.now());
            memberRepository.save(member); // Optional (JPA의 dirty checking으로 생략 가능)
        });
    }

    public void updateAccessToken(String userId, String accessToken) {
        memberRepository.findByUserId(userId).ifPresent(user -> {
            user.setAccessToken(accessToken);
            user.setEditDate(LocalDateTime.now());
            memberRepository.save(user);
        });
    }

    public void updateRefreshToken(String userId, String refreshToken) {
        memberRepository.findByUserId(userId).ifPresent(user -> {
            user.setRefreshToken(refreshToken);
            user.setEditDate(LocalDateTime.now());
            memberRepository.save(user);
        });
    }

    public String getRefreshToken(String userId) {
        return memberRepository.findByUserId(userId).map(Member::getRefreshToken).orElse(null);
    }

    public void deleteRefreshToken(String userId) {
        memberRepository.findByUserId(userId).ifPresent(user -> {
            user.setRefreshToken(null);
            memberRepository.save(user);
        });
    }

    public String getUserRole(String userId) {
        return memberRepository.findByUserId(userId).map(Member::getRole).orElse("user");
    }

    // 채용 공고 목록 조회 (페이징 적용)
    public Page<MemberDTO> getAllUsers(Pageable pageable) {
        return memberRepository.findByRoleNot("admin", pageable)
                .map(MemberDTO::from); // Page<Member> → Page<MemberDTO>
    }


    // 특정 회원 조회 (userId 기준)
    public Optional<MemberDTO> getUserByUserId(String userId) {
        return memberRepository.findByUserId(userId).map(this::convertToDTO);
    }

    // 특정 회원 조회 (userId 기준)
    public Boolean getCheckEmail(String email, String userId) {
        Optional<Member> memberOpt = memberRepository.findByEmail(email);
        if (memberOpt.isPresent()) {
            // 로그인한 사용자가 없으면(비회원이라면) 무조건 중복
            if (userId == null) {
                return true;
            }

            // 로그인한 사용자와 이메일 소유자가 다르면 중복
            Member member = memberOpt.get();
            return !member.getUserId().equals(userId);
        }

        return false;
    }

    // 특정 사용자 정보 조회
    public MemberDTO getUserById(Long idx) {
        Optional<Member> user = memberRepository.findById(idx);
        return user.map(MemberDTO::from).orElse(null);
    }

    // 사용자 정보 수정
    public boolean updateUser(String userId, Map<String, String> requestBody) {
        Optional<Member> optionalMember = memberRepository.findByUserId(userId);

        if (optionalMember.isPresent()) {
            Member member = optionalMember.get();
            member.setEmail(requestBody.get("email"));
            member.setHp(requestBody.get("hp"));
            member.setZipCode(requestBody.get("zipCode"));
            member.setAddress(requestBody.get("address"));
            member.setAddressDetail(requestBody.get("addressDetail"));
            memberRepository.save(member);
            return true;
        }
        return false;
    }


    // Entity → DTO 변환
    private MemberDTO convertToDTO(Member member) {
        return new MemberDTO(
                member.getIdx(),
                member.getRole(),
                member.getUserId(),
                member.getGender(),
                member.getBirthDay(),
                member.getName(),
                member.getEmail(),
                member.getHp(),
                member.getZipCode(),
                member.getAddress(),
                member.getAddressDetail(),
                member.getIsUse(),
                member.getIp(),
                member.getLastLogin()
        );
    }

    // 탈퇴한 회원 상태값 T로 변경
    public boolean updateUserStatusToWithdrawn(String userId){
        try {
            Optional<Member> optionalMember = memberRepository.findByUserId(userId);
            if (optionalMember.isPresent()) {
                Member member = optionalMember.get();
                member.setIsUse(UserStatus.T);
                memberRepository.save(member);
                return true;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    @Transactional
    public boolean deleteUsersByAdmin(Long idx) {
        try {
            Member member = memberRepository.findById(idx)
                    .orElseThrow(() -> new ResourceNotFoundException("해당 회원이 존재하지 않습니다."));
            member.setIsUse(UserStatus.N);
            member.setEditDate(LocalDateTime.now());
            memberRepository.save(member);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean deleteMultipleUsersByAdmin(List<Long> idxs) {
        try {
            List<Member> list = memberRepository.findAllById(idxs);
            if (list.isEmpty()) return false;

            for (Member member : list) {
                member.setIsUse(UserStatus.N);
                member.setEditDate(LocalDateTime.now());
            }

            memberRepository.saveAll(list);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    // MemberService.java
    public Page<MemberDTO> searchMembers(String role, String userId, String name, Pageable pageable) {
        if (userId != null && !userId.isBlank()) {
            return memberRepository.findByRoleAndUserIdContaining(role, userId, pageable);
        } else if (name != null && !name.isBlank()) {
            return memberRepository.findByRoleAndNameContaining(role, name, pageable);
        } else {
            return memberRepository.findAllDto(role, pageable); // 전체 목록
        }
    }


    @Transactional
    public boolean forceDeleteUsers(List<Long> idxs) {
        try {
            List<Member> members = memberRepository.findAllById(idxs);
            if (members.isEmpty()) return false;

            for (Member member : members) {
                String userId = member.getUserId();

                // ✅ 이력서 삭제 (JPA에서 cascade = ALL 적용되어 있어 연관 career, education 등도 같이 삭제됨)
                resumeRepository.findByUserId(userId).ifPresent(resume -> {
                    // 🔹 사진 파일 삭제 (필요 시)
                    commonUtils.deleteFileByUrl(resume.getPhoto());
                    // 🔹 이력서 및 연관된 Career, Education 등 모두 삭제됨
                    resumeRepository.delete(resume);
                });


                // ✅ 기타 관련 엔티티 수동 삭제 (memberId 기준)
                communityCommentRepository.deleteByUserId(userId);
                communityRepository.deleteByUserId(userId);
                jobApplicationRepository.deleteByUserId(userId);
                jobRepository.deleteByUserId(userId);
                inquiryRepository.deleteByUserId(userId);

                // ✅ 사용자 삭제
                memberRepository.delete(member);
            }

            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }


}
