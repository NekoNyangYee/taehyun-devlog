import { Metadata } from "next";
import React from "react";
import MyInfoContent from "./_components/MyInfoContent";

export const metadata: Metadata = {
  title: "내 정보 | TaeHyun's Devlog",
};

/**
 * 내 정보 페이지 (Server Component)
 * - 조립자 역할
 */
export default function MyInfoPage() {
  return <MyInfoContent />;
}
