package JobBridgeKo.com.JobBridge.util;

import JobBridgeKo.com.JobBridge.dto.resume.*;
import JobBridgeKo.com.JobBridge.entity.Resume;
import JobBridgeKo.com.JobBridge.entity.resume.*;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.*;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
public class ResumeUtils {

    public void updateCareers(List<Career> currentList, List<CareerDTO> incomingList, Resume resume) {
        Map<Long, Career> currentMap = currentList.stream()
                .filter(c -> c.getIdx() != null)
                .collect(Collectors.toMap(Career::getIdx, Function.identity()));

        List<Career> updated = new ArrayList<>();

        for (CareerDTO dto : Optional.ofNullable(incomingList).orElse(Collections.emptyList())) {
            if (dto.getIdx() != null && currentMap.containsKey(dto.getIdx())) {
                Career existing = currentMap.remove(dto.getIdx());
                existing.setCompany(dto.getCompany());
                existing.setIsWorking(dto.getIsWorking());
                existing.setStartDate(dto.getStartDate());
                existing.setEndDate(dto.getEndDate());
                existing.setContractType(dto.getContractType());
                existing.setRole(dto.getRole());
                existing.setPosition(dto.getPosition());
                existing.setDepartment(dto.getDepartment());
                existing.setDescription(dto.getDescription());
                updated.add(existing);
            } else {
                Career newCareer = Career.builder()
                        .company(dto.getCompany())
                        .isWorking(dto.getIsWorking())
                        .startDate(dto.getStartDate())
                        .endDate(dto.getEndDate())
                        .contractType(dto.getContractType())
                        .role(dto.getRole())
                        .position(dto.getPosition())
                        .department(dto.getDepartment())
                        .description(dto.getDescription())
                        .resumeIdx(resume)
                        .build();
                updated.add(newCareer);
            }
        }

        currentList.clear();
        currentList.addAll(updated);
    }

    public void updateEducationList(List<Education> currentList, List<EducationDTO> incomingList, Resume resume) {
        Map<Long, Education> currentMap = currentList.stream()
                .filter(e -> e.getIdx() != null)
                .collect(Collectors.toMap(Education::getIdx, Function.identity()));

        List<Education> updated = new ArrayList<>();

        for (EducationDTO dto : Optional.ofNullable(incomingList).orElse(Collections.emptyList())) {
            if (dto.getIdx() != null && currentMap.containsKey(dto.getIdx())) {
                Education existing = currentMap.remove(dto.getIdx());
                existing.setSchoolName(dto.getSchoolName());
                existing.setGraduationStatus(dto.getGraduationStatus());
                existing.setStartDate(dto.getStartDate());
                existing.setEndDate(dto.getEndDate());
                updated.add(existing);
            } else {
                Education newEdu = Education.builder()
                        .schoolName(dto.getSchoolName())
                        .graduationStatus(dto.getGraduationStatus())
                        .startDate(dto.getStartDate())
                        .endDate(dto.getEndDate())
                        .resumeIdx(resume)
                        .build();
                updated.add(newEdu);
            }
        }

        currentList.clear();
        currentList.addAll(updated);
    }

    public void updateSkillsList(List<Skill> currentList, List<SkillDTO> incomingList, Resume resume) {
        Map<Long, Skill> currentMap = currentList.stream()
                .filter(s -> s.getIdx() != null)
                .collect(Collectors.toMap(Skill::getIdx, Function.identity()));

        List<Skill> updated = new ArrayList<>();

        for (SkillDTO dto : Optional.ofNullable(incomingList).orElse(Collections.emptyList())) {
            if (dto.getIdx() != null && currentMap.containsKey(dto.getIdx())) {
                Skill existing = currentMap.remove(dto.getIdx());
                existing.setSkillName(dto.getSkillName());
                updated.add(existing);
            } else {
                Skill newSkill = Skill.builder()
                        .skillName(dto.getSkillName())
                        .resumeIdx(resume)
                        .build();
                updated.add(newSkill);
            }
        }

        currentList.clear();
        currentList.addAll(updated);
    }

    public void updatePortfolioList(List<Portfolio> currentList, List<PortfolioDTO> incomingList, Resume resume) {
        Map<Long, Portfolio> currentMap = currentList.stream()
                .filter(s -> s.getIdx() != null)
                .collect(Collectors.toMap(Portfolio::getIdx, Function.identity()));

        List<Portfolio> updated = new ArrayList<>();

        for (PortfolioDTO dto : Optional.ofNullable(incomingList).orElse(Collections.emptyList())) {
            if (dto.getIdx() != null && currentMap.containsKey(dto.getIdx())) {
                Portfolio existing = currentMap.remove(dto.getIdx());
                existing.setPortfolioUrl(dto.getPortfolioUrl());
                existing.setPortfolioContents(dto.getPortfolioContents());
                updated.add(existing);
            } else {
                Portfolio newSkill = Portfolio.builder()
                        .portfolioUrl(dto.getPortfolioUrl())
                        .portfolioContents(dto.getPortfolioContents())
                        .resumeIdx(resume)
                        .build();
                updated.add(newSkill);
            }
        }

        currentList.clear();
        currentList.addAll(updated);
    }

    public void updateCertificationsList(List<Certification> currentList, List<CertificationDTO> incomingList, Resume resume) {
        Map<Long, Certification> currentMap = currentList.stream()
                .filter(c -> c.getIdx() != null)
                .collect(Collectors.toMap(Certification::getIdx, Function.identity()));

        List<Certification> updated = new ArrayList<>();

        for (CertificationDTO dto : Optional.ofNullable(incomingList).orElse(Collections.emptyList())) {
            if (dto.getIdx() != null && currentMap.containsKey(dto.getIdx())) {
                Certification existing = currentMap.remove(dto.getIdx());
                existing.setCertificationName(dto.getCertificationName());
                updated.add(existing);
            } else {
                Certification newCert = Certification.builder()
                        .certificationName(dto.getCertificationName())
                        .resumeIdx(resume)
                        .build();
                updated.add(newCert);
            }
        }

        currentList.clear();
        currentList.addAll(updated);
    }

    public void deletePreviousPhotoIfExists(String photoPath, String uploadDir) {
        if (photoPath != null && !photoPath.isBlank()) {
            String fileName = Paths.get(photoPath).getFileName().toString();
            Path fullPath = Paths.get(uploadDir, fileName);
            try {
                Files.deleteIfExists(fullPath);
                System.out.println("기존 사진 삭제됨: " + fullPath);
            } catch (IOException e) {
                System.err.println("기존 사진 삭제 실패: " + fullPath);
            }
        }
    }
}
