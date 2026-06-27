import { Metadata } from "next";
import PublicUserProfileContent from "./PublicUserProfileContent";

export const metadata: Metadata = {
  title: "사용자 프로필 | TaeHyun's Devlog",
};

export default function PublicUserProfilePage() {
  return <PublicUserProfileContent />;
}
