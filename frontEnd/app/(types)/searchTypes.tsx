// types/searchTypes.ts

export interface JobDTO {
    idx: number;
    userId: string;
    title: string;
    description: string;
    experience: string;
    education: string;
    salary: string;
    preferred: string;
    useStatus: string;
    startDate: string;
    endDate: string;
    companyType: string;
    companyName: string;
    logo: string;
    industry: string;
    companyAddress: string;
  }
  
  export interface CommunityDTO {
    idx: number;
    userId: string;
    userName: string;
    category: string;
    title: string;
    content: string;
    thumbnailUrl: string | null;
    isAnonymous: string;
    isEdited: string;
    isUse: string;
    views: number;
    likes: number;
    commentsCount: number;
    regDate: string;
    editDate: string;
    tags: string[];
    attachments: {
      idx: number;
      fileUrl: string;
      fileName: string;
      fileSize: number;
      regDate: string;
      editDate: string;
    }[];
  }
  