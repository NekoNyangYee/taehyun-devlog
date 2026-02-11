import { Metadata } from "next";
import React from "react";
import LoginContent from "./_components/LoginContent";

export const metadata: Metadata = {
    title: "로그인 | TaeHyun's Devlog",
};

/**
 * 로그인 페이지 (Server Component)
 * - 조립자 역할
 */
export default function LoginPage() {
    return <LoginContent />;
}