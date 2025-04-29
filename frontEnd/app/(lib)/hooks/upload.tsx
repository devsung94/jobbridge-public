import { useCallback, useState } from 'react';

export const usePhotoUpload = () => {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const handlePhotoUpload = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      setResume: (resume: any) => void
    ) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setResume((prev: any) => ({ ...prev, photo: file }));
        setPhotoPreview(URL.createObjectURL(file));
      }
    },
    []
  );

  return { handlePhotoUpload, photoPreview, setPhotoPreview };
};
