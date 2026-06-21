export async function uploadImageToCloudinary(file: File): Promise<{
  url: string;
  bytes: number;
  filename: string;
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary 설정이 필요합니다. .env 파일을 확인하세요.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", "blog-banner");

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error("이미지 업로드에 실패했습니다.");
    }

    const data = await response.json();
    const optimizedUrl = data.secure_url.replace(
      "/upload/",
      "/upload/f_webp,q_auto,w_800/",
    );

    return {
      url: optimizedUrl,
      bytes: data.bytes,
      filename: file.name,
    };
  } catch (error) {
    console.error("Cloudinary 업로드 오류:", error);
    throw error;
  }
}

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
  const maxSize = 5 * 1024 * 1024;

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
