import { Metadata } from "next";
import BookmarkContent from "./_components/BookmarkContent";

export const metadata: Metadata = {
  title: "북마크 | TaeHyun's Devlog",
};

/**
 * 북마크 페이지 (Server Component)
 * - 조립자 역할
 */
export default function BookmarkPage() {
  return <BookmarkContent />;
}
