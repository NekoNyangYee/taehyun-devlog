import { Metadata } from "next";
import React from "react";
import ProfileDetailPage from "./Profile";

export const metadata: Metadata = {
  title: "프로필 | TaeHyun's Devlog",
};

export default function ProfilePage() {
  return <ProfileDetailPage />;
}
