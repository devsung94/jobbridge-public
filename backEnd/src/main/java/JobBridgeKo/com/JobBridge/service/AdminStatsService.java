package JobBridgeKo.com.JobBridge.service;

import JobBridgeKo.com.JobBridge.dto.StatsResponseDTO;
import JobBridgeKo.com.JobBridge.repository.MemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor // 생성자 기본 생성 옵션
public class AdminStatsService {

    private final MemberRepository memberRepository;

    public StatsResponseDTO getWeeklySignupStats() {
        List<String> labels = new ArrayList<>();
        List<Integer> dailySignups = new ArrayList<>();
        List<Integer> totalUsers = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            labels.add(date.getDayOfWeek().toString().substring(0, 1) + "요일");

            int count = memberRepository.countByCreatedDate(date);
            int cumulative = memberRepository.countByCreatedDateBeforeEqual(date);

            dailySignups.add(count);
            totalUsers.add(cumulative);
        }

        return new StatsResponseDTO(labels, dailySignups, totalUsers);
    }

}
