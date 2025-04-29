// hooks/useDaumPostcode.ts
import { useEffect } from "react";

declare global {
  interface Window {
    daum: any;
  }
}

interface DaumPostcodeData {
  sido: string;
  address: string;
  addressType: string;
  bname: string;
  buildingName: string;
  zonecode: string;
}

type Callback = (data: {
  sido: string;
  zonecode: string;
  address: string;
  addressDetail: string;
}) => void;

type PostcodeAfterCallback  = () => void;

export const useDaumPostcode = () => {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  const openPostcode = (onComplete: Callback, onAfterComplete?: PostcodeAfterCallback) => {
    new window.daum.Postcode({
      oncomplete: function (data: DaumPostcodeData) {
        let fullAddress = data.address;
        let extraAddress = "";

        if (data.addressType === "R") {
          if (data.bname) extraAddress += data.bname;
          if (data.buildingName)
            extraAddress += extraAddress ? `, ${data.buildingName}` : data.buildingName;
          fullAddress += extraAddress ? ` (${extraAddress})` : "";
        }

        onComplete({
          sido: data.sido,
          zonecode: data.zonecode,
          address: fullAddress,
          addressDetail: "",
        });

        if (onAfterComplete) {
          setTimeout(() => onAfterComplete(), 100);
        }
      },
    }).open();
  };

  return openPostcode;
};
