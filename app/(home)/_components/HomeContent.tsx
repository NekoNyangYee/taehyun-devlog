"use client";

import HeroSection from "@components/components/HeroSection";
import { PostSection } from "./PostSection";
import { CategoryGrid } from "./CategoryGrid";
import { useHomeData } from "../_hooks/useHomeData";
import { ArrowUpWideNarrowIcon, HeartIcon } from "lucide-react";

/**
 * 홈 페이지 메인 컨텐츠 (Container Component)
 * - Hook으로 데이터 관리
 * - Presentational 컴포넌트 조합
 * - 로직과 UI 완전 분리
 */
export default function HomeContent() {
    const { latestPosts, popularPosts, categories, comments } = useHomeData();

    return (
        <div className="w-full flex flex-col gap-12 md:gap-16 p-container max-w-[90rem] mx-auto">
            <HeroSection />

            <PostSection
                title="최신 게시물"
                description="가장 최근에 작성된 게시물들을 확인해보세요"
                icon={ArrowUpWideNarrowIcon}
                iconColor="text-gray-900"
                posts={latestPosts}
                categories={categories}
                comments={comments}
                variant="default"
                showViewAll={true}
            />

            <PostSection
                title="인기 게시물"
                description="조회수가 높은 게시물들입니다"
                icon={HeartIcon}
                iconColor="text-red-500"
                posts={popularPosts}
                categories={categories}
                comments={comments}
                variant="popular"
                showViewAll={false}
            />

            <CategoryGrid categories={categories} />
        </div>
    );
}
