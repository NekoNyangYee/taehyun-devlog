import { Metadata } from "next";
import React from "react";
import MyInfoPage from "./MyInfo";

export const metadata: Metadata = {
  title: "내 정보 | TaeHyun's Devlog",
};

export default function LoginPage() {
  return <MyInfoPage />;
}
