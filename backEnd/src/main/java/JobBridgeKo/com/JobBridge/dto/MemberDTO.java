package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.entity.community.Community;
import JobBridgeKo.com.JobBridge.entity.community.CommunityTag;
import JobBridgeKo.com.JobBridge.enums.GenderType;
import JobBridgeKo.com.JobBridge.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor // 생성자 자동으로 생성
@Builder
public class MemberDTO {
    private Long idx;  // ID 필드 추가
    private String role;
    private String userId;
    private GenderType gender;
    private String birthDay;
    private String name;
    private String email;
    private String hp;
    private String zipCode;
    private String address;
    private String addressDetail;
    private UserStatus isUse;
    private String ip;
    private LocalDateTime lastLogin;

    public MemberDTO(Member m) {
        this.idx = m.getIdx();
        this.role = m.getRole();
        this.userId = m.getUserId();
        this.gender = m.getGender();
        this.birthDay = m.getBirthDay();
        this.name = m.getName();
        this.email = m.getEmail();
        this.hp = m.getHp();
        this.zipCode = m.getZipCode();
        this.address = m.getAddress();
        this.addressDetail = m.getAddressDetail();
        this.isUse = m.getIsUse();
        this.ip = m.getIp();
        this.lastLogin = m.getLastLogin();
    }

    public static MemberDTO from(Member entity) {

        return MemberDTO.builder()
                .idx(entity.getIdx())
                .role(entity.getRole())
                .userId(entity.getUserId())
                .gender(entity.getGender())
                .birthDay(entity.getBirthDay())
                .name(entity.getName())
                .email(entity.getEmail())
                .hp(entity.getHp())
                .zipCode(entity.getZipCode())
                .address(entity.getAddress())
                .addressDetail(entity.getAddressDetail())
                .isUse(entity.getIsUse())
                .ip(entity.getIp())
                .lastLogin(entity.getLastLogin())
                .build();
    }
}
