package JobBridgeKo.com.JobBridge.controller.admin;

import JobBridgeKo.com.JobBridge.dto.JobDTO;
import JobBridgeKo.com.JobBridge.dto.MemberDTO;
import JobBridgeKo.com.JobBridge.dto.ResumeSummaryDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityDTO;
import JobBridgeKo.com.JobBridge.dto.community.CommunityRequestDTO;
import JobBridgeKo.com.JobBridge.dto.company.CompanyResponseDTO;
import JobBridgeKo.com.JobBridge.dto.resume.ApplicationResumeDTO;
import JobBridgeKo.com.JobBridge.entity.Job;
import JobBridgeKo.com.JobBridge.entity.Member;
import JobBridgeKo.com.JobBridge.service.CommunityService;
import JobBridgeKo.com.JobBridge.service.JobService;
import JobBridgeKo.com.JobBridge.service.MemberService;
import JobBridgeKo.com.JobBridge.util.JwtUtil;
import JobBridgeKo.com.JobBridge.util.ResponseUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@CrossOrigin(origins = "${app.front.domain}", allowCredentials = "true")
@RequestMapping("/api/admin")
public class AdminController {

    private final JwtUtil jwtUtil;
    private final CommunityService communityService;



}
