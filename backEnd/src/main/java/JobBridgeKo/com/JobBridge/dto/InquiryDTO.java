package JobBridgeKo.com.JobBridge.dto;

import JobBridgeKo.com.JobBridge.entity.Inquiry;
import JobBridgeKo.com.JobBridge.enums.InquiryType;
import JobBridgeKo.com.JobBridge.enums.UseStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InquiryDTO {
    private Long idx;
    private String userId;
    private String userName;
    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    private InquiryType inquiryType;
    private Long parentsIdx;
    private String title;
    private String content;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    private UseStatus status;

    @Enumerated(EnumType.STRING) // ← 중요! enum 이름(Y/N)으로 저장
    private UseStatus isUse;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime editDate;

    private InquiryDTO answerDTO;

    // Job Entity → JobDTO 변환하는 정적 메서드 추가
    public static InquiryDTO from(Inquiry inquiry, String userName) {
        return new InquiryDTO(
                inquiry.getIdx(),
                inquiry.getUserId(),
                userName,
                inquiry.getInquiryType(),
                inquiry.getParentsIdx(),
                inquiry.getTitle(),
                inquiry.getContent(),
                inquiry.getStatus(),
                inquiry.getIsUse(),
                inquiry.getRegDate(),
                inquiry.getEditDate(),
                null
        );
    }

}
