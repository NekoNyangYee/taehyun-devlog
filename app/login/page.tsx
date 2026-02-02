import { Metadata } from "next";
import React from "react";
import LoginDetailPage from "./Login";

export const metadata: Metadata = {
    title: "로그인 | TaeHyun's Devlog",
};

export default function LoginPage() {
    return (
        <LoginDetailPage />
    );
}