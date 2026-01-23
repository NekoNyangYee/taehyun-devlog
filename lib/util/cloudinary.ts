/**
 * Cloudinary에 이미지를 업로드하고 webp 포맷으로 변환된 URL을 반환합니다.
 * @param file - 업로드할 이미지 파일
 * @returns webp 포맷의 Cloudinary URL과 파일 크기
 */
export async function uploadImageToCloudinary(file: File): Promise<{
  url: string;
  bytes: number;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary 설정이 필요합니다. .env 파일을 확인하세요.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "blog-banner"); // 카테고리별 폴더 정리

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("이미지 업로드에 실패했습니다.");
    }

    const data = await response.json();

    // webp 포맷으로 변환하고 최적화된 URL 반환
    // f_webp: webp 포맷으로 변환
    // q_auto: 자동 품질 최적화
    // w_800: 너비 800px로 리사이즈
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/f_webp,q_auto,w_800/"
    );

    return {
      url: optimizedUrl,
      bytes: data.bytes, // Cloudinary에서 반환하는 파일 크기
    };
  } catch (error) {
    console.error("Cloudinary 업로드 에러:", error);
    throw error;
  }
}

/**
 * 이미지 파일 유효성 검사
 * @param file - 검사할 파일
 * @returns 유효성 검사 결과
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  const validTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!validTypes.includes(file.type)) {
    return {
      isValid: false,
      error: "JPG, PNG, GIF, WEBP 형식의 이미지만 업로드 가능합니다.",
    };
  }

  if (file.size > maxSize) {
    return {
      isValid: false,
      error: "파일 크기는 5MB 이하여야 합니다.",
    };
  }

  return { isValid: true };
}
