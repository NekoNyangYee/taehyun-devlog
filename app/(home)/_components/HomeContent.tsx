"use client";

import { CategoryGrid } from "./CategoryGrid";
import { PostCarousel } from "./PostCarousel";
import { useHomeData } from "../_hooks/useHomeData";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";

export default function HomeContent() {
  const { posts, categories, comments } = useHomeData();

  return (
    <motion.div
      {...contentReveal}
      className="w-full flex flex-col gap-16 md:gap-20 p-container max-w-[90rem] mx-auto"
    >
      <PostCarousel posts={posts} categories={categories} comments={comments} />
      <CategoryGrid categories={categories} />
    </motion.div>
  );
}
