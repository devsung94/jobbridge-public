// useResumeForm.ts

import { useRef, useState, useEffect } from "react";
import { contractTypeOptions, graduationStatusOptions, isWorkingOptions } from "@/constants/options";

export type Career = {
  idx?: number;
  isWorking: string;
  company: string;
  startDate: string;
  endDate: string;
  role: string;
  position: string;
  department: string;
  description: string;
  contractType: string;
};

export type Education = {
  idx?: number;
  schoolName: string;
  graduationStatus?: string;
  startDate?: string;
  endDate?: string;
};

export type Skill = {
  idx?: number;
  skillName: string;
};

export type Certification = {
  idx?: number;
  certificationName: string;
};

// ✅ [추가] 포트폴리오 타입
export type Portfolio = {
  idx?: number;
  portfolioUrl: string;
  portfolioContents: string;
};


export type Resume = {
  photo: File | null | string;
  isExperienced: string;
  careerSummary: string;
  coverLetter: string;
  skillsList: Skill[];
  educationList: Education[];
  certificationsList: Certification[];
  careers: Career[];
  portfolioList: Portfolio[];
};

export type CareerField = keyof Career;
export type ListField = "educationList" | "skillsList" | "certificationsList" | "portfolioList";

export const useResumeForm = () => {
  const [resume, setResume] = useState<Resume>({
    isExperienced: "",
    careerSummary: "",
    coverLetter: "",
    photo: null,
    educationList: [{ schoolName: "", graduationStatus: "", startDate: "", endDate: "" }],
    skillsList: [{ skillName: "" }],
    certificationsList: [{ certificationName: "" }],
    portfolioList: [{ portfolioUrl: "", portfolioContents: "" }], 
    careers: [
      {
        isWorking: isWorkingOptions[0].value,
        company: "",
        startDate: "",
        endDate: "",
        contractType: contractTypeOptions[0].value,
        role: "",
        position: "",
        department: "",
        description: "",
      },
    ],
  });

  const educationRefs = useRef<HTMLInputElement[]>([]);
  const skillRefs = useRef<HTMLInputElement[]>([]);
  const certificationRefs = useRef<HTMLInputElement[]>([]);
  const portfolioRefs = {
    portfolioUrl: useRef<HTMLInputElement[]>([]),
    portfolioContents: useRef<HTMLInputElement[]>([]),
  };
  const careerRefs = {
    company: useRef<HTMLInputElement[]>([]),
    isWorking: useRef<HTMLInputElement[]>([]),
    startDate: useRef<HTMLInputElement[]>([]),
    endDate: useRef<HTMLInputElement[]>([]),
    contractType: useRef<HTMLInputElement[]>([]),
    role: useRef<HTMLInputElement[]>([]),
    position: useRef<HTMLInputElement[]>([]),
    department: useRef<HTMLInputElement[]>([]),
    description: useRef<HTMLTextAreaElement[]>([]),
  };

  useEffect(() => {
    educationRefs.current = Array(resume.educationList.length).fill(null);
    skillRefs.current = Array(resume.skillsList.length).fill(null);
    certificationRefs.current = Array(resume.certificationsList.length).fill(null);
    portfolioRefs.portfolioUrl.current = Array(resume.portfolioList.length).fill(null);
    portfolioRefs.portfolioContents.current = Array(resume.portfolioList.length).fill(null);
    careerRefs.company.current = Array(resume.careers.length).fill(null);
    careerRefs.role.current = Array(resume.careers.length).fill(null);
    careerRefs.position.current = Array(resume.careers.length).fill(null);
    careerRefs.department.current = Array(resume.careers.length).fill(null);
    careerRefs.description.current = Array(resume.careers.length).fill(null);
  }, [resume]);

  const handleChange = (e: React.ChangeEvent<any>) => {
    setResume({ ...resume, [e.target.name]: e.target.value });
  };

  const addCareer = () => {
    setResume((prev) => ({
      ...prev,
      careers: [
        ...prev.careers,
        {
          isWorking: isWorkingOptions[0].value,
          company: "",
          startDate: "",
          endDate: "",
          role: "",
          position: "",
          department: "",
          description: "",
          contractType: contractTypeOptions[0].value,
        },
      ],
    }));
  };

  const updateCareer = (index: number, updatedCareer: Career) => {
    const newCareers = [...resume.careers];
    newCareers[index] = updatedCareer;
    setResume((prev) => ({ ...prev, careers: newCareers }));
  };

  const removeCareer = (index: number) => {
    if (resume.careers.length <= 1) return;
    const newCareers = [...resume.careers];
    newCareers.splice(index, 1);
    setResume((prev) => ({ ...prev, careers: newCareers }));
  };

  const addItemToList = (field: ListField) => {
    const emptyItem =
      field === "educationList"
        ? { schoolName: "", graduationStatus: "", startDate: "", endDate: "" }
        : field === "skillsList"
        ? { skillName: "" }
        : field === "certificationsList"
        ? { certificationName: "" }
        : { portfolioUrl: "" , portfolioContents: "" };

    setResume((prev) => ({
      ...prev,
      [field]: [...prev[field], emptyItem],
    }));
  };

  const updateListItem = (field: ListField, index: number, value: any) => {
    const newList = [...resume[field]];
    newList[index] = value;
    setResume((prev) => ({ ...prev, [field]: newList }));
  };

  const removeItemFromList = (field: ListField, index: number) => {
    if (resume[field].length <= 1) return;
    const newList = [...resume[field]];
    newList.splice(index, 1);
    setResume((prev) => ({ ...prev, [field]: newList }));
  };

  const validateResume = (photoPreview?: string | null): { valid: boolean; message?: string } => {
    let num = 0;

    // 프로필 사진 검사
    if (!resume.photo && !photoPreview) {
      return { valid: false, message: "프로필 사진을 업로드해주세요." };
    }
    if (!resume.isExperienced) return { valid: false, message: "경력 유무를 선택해주세요." };
    if (!resume.careerSummary.trim()) return { valid: false, message: "커리어 요약을 작성해주세요." };

    if (resume.isExperienced === "경력") {
      for (let i = 0; i < resume.careers.length; i++) {
        const c = resume.careers[i];
        num = i + 1;
        // console.log("c",c);
        if (!c.company.trim()) {
          careerRefs.company.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 회사명을 입력해주세요." };
        }
        if (!c.isWorking?.trim()) {
          careerRefs.isWorking.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 재직 상태를 선택해주세요." };
        }
        if (!c.startDate.trim()) {
          careerRefs.startDate.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 시작일을 입력해주세요." };
        }
        if (c.isWorking === "퇴사" && !c.endDate?.trim()) {
          careerRefs.endDate.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 퇴사일을 입력해주세요." };
        }
        if (!c.contractType.trim()) {
          careerRefs.contractType.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 계약유형을 선택해주세요." };
        }
        if (!c.department.trim()) {
          careerRefs.department.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 부서를 입력해주세요." };
        }
        if (!c.position.trim()) {
          careerRefs.position.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 직급을 입력해주세요." };
        }
        if (!c.role.trim()) {
          careerRefs.role.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 직무를 입력해주세요." };
        }
        if (!c.description.trim()) {
          careerRefs.description.current[i]?.focus();
          return { valid: false, message: num + "번 경력 항목 담당 업무를 입력해주세요." };
        }
      }
    }

    for (let i = 0; i < resume.educationList.length; i++) {
      num = i + 1;
      if (!resume.educationList[i].schoolName.trim()) {
        educationRefs.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 학교명을 입력해주세요." };
      }
      if (!resume.educationList[i].graduationStatus?.trim()) {
        educationRefs.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 졸업 상태를 선택해주세요." };
      }
      if (!resume.educationList[i].startDate?.trim()) {
        educationRefs.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 입학일을 입력해주세요." };
      }
      if (!resume.educationList[i].endDate?.trim()) {
        educationRefs.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 졸업일을 입력해주세요." };
      }
    }
    for (let i = 0; i < resume.skillsList.length; i++) {
      num = i + 1;
      if (!resume.skillsList[i].skillName.trim()) {
        skillRefs.current[i]?.focus();
        return { valid: false, message: num + "번 스킬 항목 내용을 입력해주세요." };
      }
    }
    for (let i = 0; i < resume.portfolioList.length; i++) {
      num = i + 1;
      if (!resume.portfolioList[i].portfolioUrl.trim()) {
        portfolioRefs.portfolioUrl.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 포트폴리오 URL을 입력해주세요." };
      }
      if (!resume.portfolioList[i].portfolioContents?.trim()) {
        portfolioRefs.portfolioContents.current[i]?.focus();
        return { valid: false, message: num + "번 학력 항목 포트폴리오 내용을 입력력해주세요." };
      }
    }

    for (let i = 0; i < resume.certificationsList.length; i++) {
      num = i + 1;
      if (!resume.certificationsList[i].certificationName.trim()) {
        certificationRefs.current[i]?.focus();
        return { valid: false, message: num + "번 자격/어학/수상 항목 내용을 입력해주세요." };
      }
    }
    
    if (!resume.coverLetter.trim()) return { valid: false, message: "자기소개서를 작성해주세요." };
    return { valid: true };
  };

  return {
    resume,
    setResume,
    handleChange,
    addCareer,
    updateCareer,
    removeCareer,
    addItemToList,
    updateListItem,
    removeItemFromList,
    validateResume,
    educationRefs,
    skillRefs,
    certificationRefs,
    careerRefs,
  };
};
