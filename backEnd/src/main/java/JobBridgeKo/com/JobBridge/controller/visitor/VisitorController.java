package JobBridgeKo.com.JobBridge.controller.visitor;


import JobBridgeKo.com.JobBridge.dto.VisitorRequestDTO;
import JobBridgeKo.com.JobBridge.service.VisitorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/visitor")
@RequiredArgsConstructor // 생성자 기본 생성 옵션
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true") // CORS 허용
public class VisitorController {

    private final VisitorService visitorService;

    @PostMapping
    public void recordVisitor(@RequestBody VisitorRequestDTO visitorRequestDTO, HttpServletRequest request) {
        visitorService.recordVisitor(visitorRequestDTO.getPath(), request);
    }

}
