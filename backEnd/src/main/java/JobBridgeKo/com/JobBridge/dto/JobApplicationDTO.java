package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.enums.JobApplicationStatus;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor // 생성자 자동으로 생성
public class JobApplicationDTO {
    private Long idx;
    private Long jobIdx;
    private String userId;
    private UseStatus isRead;
    private UseStatus isUse;
    private JobApplicationStatus isStatus;
    private LocalDateTime cancelDate;
    private LocalDateTime readDate;
    private LocalDateTime regDate;
    private LocalDateTime editDate;


    // 추가
    private String logo;
    private String companyName;

    private String title;
    private String description;
    private String experience;
    private String education;

    private String address;
    private String addressDetail;

    private String salary;
    private String preferred;
    private Date startDate;
    private Date endDate;

    private String statusText; // 프론트에서 "지원 완료" 또는 "지원 취소"로 표시하기 위한 필드
}
