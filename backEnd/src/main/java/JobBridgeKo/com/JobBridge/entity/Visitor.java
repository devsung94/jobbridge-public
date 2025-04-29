package JobBridgeKo.com.JobBridge.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "visitor",
        indexes = {
                @Index(name = "idx_visitor_ip", columnList = "vi_ip_address"),
                @Index(name = "idx_visitor_path", columnList = "vi_path"),
                @Index(name = "idx_visitor_reg_date", columnList = "vi_reg_date")
        }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Visitor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vi_idx")
    private Long idx;

    @Column(name = "vi_ip_address", nullable = false)
    private String ipAddress;

    @Column(name = "vi_path", nullable = false)
    private String path;

    @Column(name = "vi_user_agent")
    private String userAgent;

    @Column(name = "vi_reg_date", columnDefinition = "DATETIME(0)")
    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime regDate;
}
