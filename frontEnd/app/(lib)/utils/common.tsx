import { format, parseISO } from "date-fns";


export const calculateAge = (birthDateStr: string | null | undefined): string => {
  if (!birthDateStr) return "정보 없음";

  const birthDate = new Date(birthDateStr);
  if (isNaN(birthDate.getTime())) return "정보 없음";

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  const hasBirthdayPassed =
    today.getMonth() > birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() >= birthDate.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return `${age}세`;
};


// utils/numberFormatter.ts
export const numberFormatter = (value: number | string): string => {
  if (value === null || value === undefined || value === "") return "";
  const number = typeof value === "number" ? value : Number(value.toString().replace(/,/g, ""));
  if (isNaN(number)) return "";
  return number.toLocaleString("ko-KR");
};

export const formatBizNumber = (input: string) => {
  const nums = input.replace(/\D/g, ""); // 숫자만 남김
  if (nums.length <= 3) return nums;
  if (nums.length <= 5) return `${nums.slice(0, 3)}-${nums.slice(3)}`;
  if (nums.length <= 10) return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5)}`;
  return `${nums.slice(0, 3)}-${nums.slice(3, 5)}-${nums.slice(5, 10)}`;
};

export function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 4) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}


export function formatDateTime(dateString: string): string {
  // const date = new Date(dateString);

  // return date.toLocaleString("ko-KR", {
  //   year: "numeric",
  //   month: "2-digit",
  //   day: "2-digit",
  //   hour: "2-digit",
  //   minute: "2-digit",
  //   second: "2-digit",
  //   hour12: false,
  // });
  return format(parseISO(dateString), "yyyy-MM-dd HH:mm:ss");
}

// components/common/ProfileImage.tsx
export function ProfileImage({ photoUrl }: { photoUrl: string }) {
  const fallbackUrl = process.env.NEXT_PUBLIC_API_PATH + "/uploads/default_profile.jpg";

  // 이미지 확장자 자동 감지
  const isWebp = photoUrl.endsWith(".webp");
  const isPng = photoUrl.endsWith(".png");
  const isJpg = photoUrl.endsWith(".jpg") || photoUrl.endsWith(".jpeg");

  return (
    <picture>
      {/* WebP가 있을 경우 */}
      {isWebp && <source srcSet={photoUrl} type="image/webp" />}

      {/* PNG가 있을 경우 */}
      {isPng && <source srcSet={photoUrl} type="image/png" />}

      {/* JPG가 기본 */}
      {isJpg && <source srcSet={photoUrl} type="image/jpeg" />}

      <img
        src={photoUrl}
        alt="프로필 사진"
        className="w-full h-full object-cover"
        onError={(e) => {
          const target = e.currentTarget as HTMLImageElement;
          if (!target.src.includes("default_profile")) {
            target.src = fallbackUrl;
          }
        }}
      />
    </picture>
  );
}


export const getYearsSince = (dateString: string): string => {
  if (!dateString) return "";
  const founded = new Date(dateString);
  const now = new Date();

  let years = now.getFullYear() - founded.getFullYear();
  const isBeforeAnniversary =
    now.getMonth() < founded.getMonth() ||
    (now.getMonth() === founded.getMonth() && now.getDate() < founded.getDate());

  if (isBeforeAnniversary) years -= 1;

  return `${years}년 차`;
};



  
