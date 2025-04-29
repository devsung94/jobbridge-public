// types/resume.ts

export interface CareerDTO {
    idx: number;
    isWorking: string;
    company: string;
    startDate: string;
    endDate: string;
    contractType: string;
    period: string;
    role: string;
    position: string;
    department: string;
    description: string;
  }
  
  export interface EducationDTO {
    idx: number;
    graduationStatus: string;
    schoolName: string;
    startDate: string;
    endDate: string;
  }
  
  export interface SkillDTO {
    idx: number;
    skillName: string;
  }
  
  export interface PortfolioDTO {
    idx: number;
    portfolioUrl: string;
    portfolioContents: string;
  }
  
  export interface CertificationDTO {
    idx: number;
    certificationName: string;
  }
  
  export interface ResumeResponseDTO {
    idx: number;
    userId: string;
    name: string;
    gender: string; // 'M' 또는 'F'
    birthDay: string; // yyyy-MM-dd
    email: string;
    hp: string;
    zipCode: string;
    address: string;
    addressDetail: string;
    isExperienced: string;
    careerSummary: string;
    coverLetter: string;
    photo: string;

    isUse: string;
    isRead: string;
    isStatus: string;

    regDate: string;

    careers: CareerDTO[];
    educationList: EducationDTO[];
    skillsList: SkillDTO[];
    portfolioList: PortfolioDTO[];
    certificationsList: CertificationDTO[];
  }
  