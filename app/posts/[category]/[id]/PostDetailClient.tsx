"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { PostState } from "@components/types/post";
import { useParams, usePathname, useRouter } from "next/navigation";
import dayjs, { formatDate } from "@components/lib/util/dayjs";
import Link from "next/link";
import {
  ArrowLeftCircle,
  ArrowRightCircle,
  BadgeCheck,
  CalendarRangeIcon,
  CopyIcon,
  CornerDownRight,
  EyeIcon,
  EyeOffIcon,
  Heart,
  LockIcon,
  MessageSquareXIcon,
  PencilIcon,
  SendIcon,
  Share2Icon,
  TagIcon,
  XIcon,
} from "lucide-react";
import PageLoading from "@components/components/loading/PageLoading";
import { Button } from "@components/components/ui/button";
import { useSessionStore } from "@components/store/sessionStore";
import { cn } from "@components/lib/utils";
import { Textarea } from "@components/components/ui/textarea";
import Image from "next/image";
import { useUIStore } from "@components/store/postLoadingStore";
import { lowerURL } from "@components/lib/util/lowerURL";
import NotFound from "@components/app/not-found";
import { GotoTop } from "@components/components/GoToTop";
import { useQuery } from "@tanstack/react-query";
import {
  fetchPostsQueryFn,
  postsQueryKey,
  fetchPostByIdQueryFn,
  postDetailQueryKey,
} from "@components/queries/postQueries";
import {
  categoriesQueryKey,
  fetchCategoriesQueryFn,
} from "@components/queries/categoryQueries";
import {
  commentsQueryKey,
  fetchCommentsQueryFn,
} from "@components/queries/commentQueries";
import {
  useIncrementViewCount,
  useToggleLike,
} from "@components/queries/postMutations";
import {
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from "@components/queries/commentMutations";
import {
  profileQueryKey,
  fetchProfileQueryFn,
} from "@components/queries/profileQueries";
import ImageViewer from "@components/components/ImageViewer";
import MobileTOC from "@components/components/MobileTOC";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { useCommentStore } from "@components/store/commentStore";
import { motion } from "framer-motion";
import { contentReveal } from "@components/components/motion/contentReveal";

interface Heading {
  id: string;
  text: string;
  tag?: string;
}

interface HeadingGroup {
  h2: Heading;
  h3: Heading[];
}

/** 본문에서 h2, h3 태그에 고유 id를 부여하고 목차 데이터를 반환 (순수 함수) */
function extractHeadings(htmlContent: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");

  const headingCounts: { [key: string]: number } = {};
  let h2Count = 0;

  const headings = Array.from(doc.querySelectorAll("h2, h3")).map((heading) => {
    let baseId =
      heading.textContent?.replace(/\s+/g, "-").toLowerCase() || "";

    if (headingCounts[baseId]) {
      headingCounts[baseId] += 1;
      baseId = `${baseId}-${headingCounts[baseId]}`;
    } else {
      headingCounts[baseId] = 1;
    }

    heading.id = baseId;
    if (heading.tagName === "H2") h2Count++;

    return {
      id: baseId,
      text: heading.textContent || "",
      tag: heading.tagName,
      h2Index: h2Count,
    };
  });

  return { headings, updatedHtml: doc.body.innerHTML };
}

/**
 * 별도 컴포넌트로 분리: 부모 재렌더 시에도 컴포넌트 아이덴티티 유지되어 깜빡임 방지
 */
function RenderedContent({
  html,
  onImagesExtracted,
  onImageClick,
}: {
  html: string;
  onImagesExtracted?: (images: string[]) => void;
  onImageClick?: (index: number) => void;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html || "";

    // 이미지 스타일 적용 및 이미지 목록 수집
    const extractedImages: string[] = [];
    ref.current.querySelectorAll("img").forEach((img) => {
      const el = img as HTMLImageElement;
      el.style.display = "block";
      el.style.margin = "20px auto";
      el.style.maxWidth = "100%";
      el.style.height = "auto";
      el.style.cursor = "zoom-in";
      extractedImages.push(el.src);
    });
    onImagesExtracted?.(extractedImages);

    // 제목 여백
    ref.current.querySelectorAll("h1, h2, h3").forEach((heading) => {
      const el = heading as HTMLHeadingElement;
      el.style.margin = "1rem 0";
    });

    // 하이라이트
    let attempts = 0;
    const maxAttempts = 10;
    const tryHighlight = () => {
      const hljs = window.hljs;
      if (hljs) {
        ref.current?.querySelectorAll("pre code").forEach((el) => {
          hljs.highlightElement(el as HTMLElement);
        });
      } else if (++attempts < maxAttempts) {
        setTimeout(tryHighlight, 150);
      }
    };
    tryHighlight();
  }, [html, onImagesExtracted]);

  // 이벤트 위임: 컨테이너 onClick으로 이미지 클릭 감지
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const img = target.closest("img") as HTMLImageElement | null;
      if (!img || !ref.current) return;
      const images = Array.from(ref.current.querySelectorAll("img"));
      const index = images.indexOf(img);
      if (index !== -1) onImageClick?.(index);
    },
    [onImageClick],
  );

  return (
    <div
      ref={ref}
      className="leading-relaxed post-content"
      onClick={handleClick}
    />
  );
}

export default function PostDetailClient() {
  const { session } = useSessionStore();
  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const { id, category: urlCategory } = params;

  const [post, setPost] = useState<PostState | null>(null);
  const [hasIncremented, setHasIncremented] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [isAdmin] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isStatus, setIsStatus] = useState<boolean>(true);
  const [isReplyStatus, setIsReplyStatus] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
  const [postImages, setPostImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );
  const [activeHeadingId, setActiveHeadingId] = useState<string>("");
  const [shareUrl, setShareUrl] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const setPostLoading = useUIStore((state) => state.setPostLoading);
  const userId = session?.user?.id;
  const openLogin = useLoginModalStore((s) => s.open);
  const {
    editingCommentId,
    editingContent,
    editingStatus,
    startEditingComment,
    setEditingContent,
    setEditingStatus,
    cancelEditingComment,
  } = useCommentStore();

  // ✅ TanStack Query로 데이터 가져오기
  const { data: posts = [] } = useQuery({
    queryKey: postsQueryKey,
    queryFn: fetchPostsQueryFn,
  });

  const { data: categories = [] } = useQuery({
    queryKey: categoriesQueryKey,
    queryFn: fetchCategoriesQueryFn,
  });

  const resolvedPostId = Array.isArray(id) ? id[0] : id;
  const numericPostId = Number(resolvedPostId);
  const hasValidPostId = Number.isFinite(numericPostId);

  const postDetailQuery = useQuery({
    queryKey: postDetailQueryKey(numericPostId),
    queryFn: () => fetchPostByIdQueryFn(numericPostId),
    enabled: hasValidPostId,
  });

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey([numericPostId], true),
    queryFn: () =>
      fetchCommentsQueryFn([numericPostId], { includePrivate: true }),
    enabled: hasValidPostId,
  });
  const publicCommentCount = comments.filter((comment) => !comment.status).length;

  // ✅ 게시물 작성자 프로필 가져오기
  const { data: authorProfiles = [] } = useQuery({
    queryKey: profileQueryKey(post?.author_id),
    queryFn: () => fetchProfileQueryFn(post?.author_id),
    enabled: !!post?.author_id,
  });

  const authorProfile = authorProfiles[0];

  // ✅ Mutation hooks
  const viewCountMutation = useIncrementViewCount();
  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment([numericPostId]);
  const deleteCommentMutation = useDeleteComment([numericPostId]);
  const updateCommentMutation = useUpdateComment([numericPostId]);

  const isHydratingPost = postDetailQuery.isLoading && !postDetailQuery.data;

  // query state → 로컬 상태 동기화 (setPost/setIsNotFound는 외부 비동기 상태 반영용으로
  // 룰의 의도와 충돌하므로 disable. TanStack Query setQueryData 기반 리팩토링은 별도 작업).
  useEffect(() => {
    if (!postDetailQuery.error) return;
    console.error("게시물 상세 로드 실패:", postDetailQuery.error);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNotFound(true);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(false);
    setPostLoading(false);
  }, [postDetailQuery.error, setPostLoading]);

  useEffect(() => {
    if (!postDetailQuery.data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPost(postDetailQuery.data);
  }, [postDetailQuery.data]);

  // ✅ URL 카테고리와 실제 게시물 카테고리 검증 (불일치 시 올바른 URL로 replace)
  // 주의: 게시물 전환 중 race condition 방지 위해 post.id === numericPostId 일 때만 검증
  useEffect(() => {
    if (!post || categories.length === 0 || !urlCategory) return;
    if (post.id !== numericPostId) return; // 이전 게시물 데이터로 잘못 검증되는 것 방지

    const postCategory = categories.find(
      (cat) => cat.id === post.category_id,
    );
    if (!postCategory) return;

    let urlCategoryValue = Array.isArray(urlCategory)
      ? urlCategory[0]
      : urlCategory;

    try {
      urlCategoryValue = decodeURIComponent(urlCategoryValue);
    } catch {
      /* already decoded or invalid % sequence */
    }

    const normalizedUrl = urlCategoryValue.trim().toLowerCase();
    const normalizedActual = lowerURL(postCategory.name).trim();

    if (normalizedUrl !== normalizedActual) {
      console.warn("[PostDetail] 카테고리 불일치 - 올바른 URL로 교정", {
        urlDecoded: urlCategoryValue,
        actual: postCategory.name,
      });
      const correctSlug = encodeURIComponent(lowerURL(postCategory.name));
      router.replace(`/posts/${correctSlug}/${post.id}`);
    }
  }, [post, categories, urlCategory, router, numericPostId]);

  useEffect(() => {
    setPostLoading(isHydratingPost);
  }, [isHydratingPost, setPostLoading]);

  useEffect(() => {
    if (post && !hasIncremented) {
      const incrementView = async () => {
        try {
          await viewCountMutation.mutateAsync(post.id);
          setHasIncremented(true);
          const newViewCount = (post.view_count ?? 0) + 1;
          setPost((prev) =>
            prev ? { ...prev, view_count: newViewCount } : prev,
          );
        } catch (error) {
          console.error("조회수 증가 실패:", error);
        }
      };
      incrementView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id, hasIncremented]);

  useEffect(() => {
    setShareUrl(window.location.href);
  }, [post?.id]);

  // 본문 내용이 바뀔 때만 목차 재계산 (좋아요로 인한 불필요한 재계산 방지)
  const postContents = post?.contents;
  const { headings, updatedContent } = useMemo(() => {
    if (!postContents) return { headings: [], updatedContent: "" };
    const result = extractHeadings(postContents);
    return { headings: result.headings, updatedContent: result.updatedHtml };
  }, [postContents]);

  // 스크롤 위치 기반 현재 활성 헤딩 추적 (뷰포트 중앙 기준)
  useEffect(() => {
    if (headings.length === 0) return;

    const handleScroll = () => {
      const viewportMiddle = window.innerHeight / 2;
      let currentId = headings[0]?.id ?? "";
      for (const heading of headings) {
        const el = document.getElementById(heading.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= viewportMiddle) {
          currentId = heading.id;
        } else {
          break;
        }
      }
      setActiveHeadingId(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [headings]);

  // 좋아요 상태 (파생)
  const isHeartClicked =
    !!session?.user?.id &&
    (post?.liked_by_user?.includes(session.user.id) ?? false);

  /** 클릭 시 해당 제목으로 스크롤 이동 + URL 변경 */
  const scrollToHeading = (id: string, updateUrl = true) => {
    setTimeout(() => {
      const decodedId = decodeURIComponent(id);
      const headingElement = document.getElementById(decodedId);
      if (headingElement) {
        headingElement.scrollIntoView({ behavior: "smooth", block: "center" });

        // 🔥 URL에 # 추가하여 경로 업데이트
        if (updateUrl) {
          const newUrl = `${window.location.pathname}#${decodedId}`;
          router.replace(newUrl, { scroll: false });
        }
      }
    }, 500); // 500ms 대기 후 실행
  };

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash.replace("#", ""));
    if (!hash) return;

    const scrollToHash = () => {
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        // DOM에 아직 안 생겼으면 다음 프레임에서 다시 시도
        requestAnimationFrame(scrollToHash);
      }
    };

    scrollToHash(); // 실행
  }, [updatedContent]);

  const category = categories.find((cat) => cat.id === post?.category_id);

  if (isNotFound) {
    return <NotFound />;
  }

  if (!post) {
    return <PageLoading />;
  }

  // 목차를 구조적으로 정리 (h2 → h3 그룹핑)
  const headingGroups: HeadingGroup[] = [];
  let currentH2: Heading | null = null;

  headings.forEach((heading) => {
    if (heading.tag === "H2") {
      currentH2 = { id: heading.id, text: heading.text };
      headingGroups.push({ h2: currentH2, h3: [] });
    } else if (heading.tag === "H3" && currentH2) {
      headingGroups[headingGroups.length - 1].h3.push({
        id: heading.id,
        text: heading.text,
      });
    }
  });

  const postCategory = (categoryId: string | number) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category?.name || "카테고리 없음";
  };

  const currentPageIndex = posts.findIndex((p) => p.id === post?.id);

  const previousPage =
    currentPageIndex > 0 ? posts[currentPageIndex - 1] : null;
  const nextPage =
    currentPageIndex < posts.length - 1 ? posts[currentPageIndex + 1] : null;

  const handleHeartClick = () => {
    if (!session) {
      if (
        confirm("로그인을 해야 좋아요를 누를 수 있습니다. 로그인 하시겠어요?")
      ) {
        openLogin();
      }
      return;
    }

    if (!userId || !post) return;

    toggleLikeMutation.mutate(
      { postId: post.id, likedByUser: userId },
      {
        onSuccess: (metrics) => {
          // post.liked_by_user가 업데이트되면 isHeartClicked는 자동 파생됨
          setPost((prev) => (prev ? { ...prev, ...metrics } : prev));
        },
        onError: (error) => {
          console.error("🚨 좋아요 처리 중 오류 발생:", error);
        },
      },
    );
  };

  const handleSubmitReply = async () => {
    if (comment.trim() === "") {
      alert("댓글을 입력하세요.");
      return;
    }

    if (!comment || !session?.user || !post?.id) return;

    const author_name: string =
      session?.user?.user_metadata?.full_name || "익명";

    await addCommentMutation.mutateAsync({
      author_id: session?.user.id,
      author_name,
      profile_image: session?.user.user_metadata.avatar_url ?? "",
      post_id: post?.id,
      parent_id: null,
      content: comment,
      status: !isStatus,
    });

    setComment("");
  };

  const deleteHandleComment = async (commentId: string | number) => {
    if (!commentId) return;
    if (confirm("정말 삭제하시겠습니까?")) {
      await deleteCommentMutation.mutateAsync(commentId);
    }
  };

  const handleStartEditComment = (targetComment: (typeof comments)[number]) => {
    setReplyingTo(null);
    startEditingComment(
      Number(targetComment.id),
      targetComment.content,
      targetComment.status,
    );
  };

  const handleShare = async () => {
    if (!post) return;

    const url = shareUrl || window.location.href;
    const isPc = window.matchMedia("(pointer: fine)").matches;

    if (!isPc && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: `${post.title} 글을 확인해보세요.`,
          url,
        });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }

    setIsShareModalOpen(true);
  };

  const handleCopyShareUrl = async () => {
    const url = shareUrl || window.location.href;
    await navigator.clipboard.writeText(url);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1500);
  };

  const handleUpdateComment = async (commentId: number) => {
    if (editingContent.trim() === "") {
      alert("댓글을 입력하세요.");
      return;
    }

    await updateCommentMutation.mutateAsync({
      id: commentId,
      content: editingContent,
      status: editingStatus,
      updated_at: new Date().toISOString(),
    });
    cancelEditingComment();
  };

  const canViewComment = (comment: (typeof comments)[number]) => {
    return (
      !comment.status || // 공개 댓글이거나
      comment.author_id === session?.user?.id || // 내가 쓴 댓글이거나
      post?.author_id === session?.user?.id // 게시글 작성자일 경우
    );
  };

  const handleSubmitSubCommment = async (parentId: number) => {
    if (replyContent.trim() === "") {
      alert("답글을 입력하세요.");
      return;
    }

    if (!replyContent || !session?.user || !post?.id) return;

    const author_name: string =
      session?.user?.user_metadata?.full_name || "익명";

    await addCommentMutation.mutateAsync({
      author_id: session?.user.id,
      author_name,
      profile_image: session?.user.user_metadata.avatar_url ?? "",
      parent_id: parentId,
      post_id: post?.id,
      content: replyContent,
      status: !isReplyStatus,
    });

    setReplyContent("");
    setReplyingTo(null);
  };

  const toggleReply = (commentId: number) => {
    setReplyingTo((prev) => (prev === commentId ? null : commentId));
  };

  if (loading || isHydratingPost) {
    return <PageLoading />;
  }

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <motion.div
      {...contentReveal}
      className="relative flex-1 min-w-0 w-full"
    >
      {/* 제목 / 카테고리 / 메타 정보 */}
      <div className="w-full max-w-[1200px] mx-auto px-4 pt-10 pb-6 flex flex-col gap-4">
        <Link
          href={`/posts/${encodeURIComponent(category?.name || "")}`}
          className="inline-flex items-center gap-2 self-start rounded-full bg-gray-900 text-white px-3 py-1 text-sm"
        >
          <TagIcon size={14} />
          {postCategory(post.category_id)}
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 dark:text-gray-100">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-metricsText">
          <span className="flex items-center gap-1.5">
            <CalendarRangeIcon size={16} />
            {formatDate(post.created_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <EyeIcon size={16} />
            {post.view_count}
          </span>
        </div>
      </div>

      {/* 본문 영역 */}
      <div className="relative z-10">
        <div className="min-h-screen">
          <MobileTOC
            headingGroups={headingGroups}
            activeId={activeHeadingId}
            onScrollTo={scrollToHeading}
          />
          <div className="break-words whitespace-pre-wrap w-full max-w-[1200px] mx-auto px-4 pt-12 pb-4">
      <div className="flex flex-col-reverse lg:flex-row gap-6">
        <article className="flex-1 min-w-0">
          <RenderedContent
            html={updatedContent || post?.contents || ""}
            onImagesExtracted={setPostImages}
            onImageClick={setSelectedImageIndex}
          />
        </article>
        {headingGroups.length > 0 && (
          <aside className="hidden lg:flex flex-col gap-2 lg:w-[300px] lg:sticky top-20 self-start w-full">
            <h3 className="text-lg font-semibold m-0">목차</h3>
            <nav className="flex flex-col gap-4 border-l border-gray-200 dark:border-white/15 pl-4">
              {headingGroups.map((group, index) => (
                <div key={group.h2.id} className="flex flex-col gap-2">
                  <button
                    onClick={() => scrollToHeading(group.h2.id)}
                    className={`text-sm font-bold cursor-pointer hover:underline text-left rounded px-2 py-1 transition-colors ${
                      activeHeadingId === group.h2.id
                        ? "text-blue-500 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300"
                        : ""
                    }`}
                  >
                    {`${index + 1}. ${group.h2.text}`}
                  </button>
                  {group.h3.length > 0 && (
                    <div className="ml-2 flex flex-col gap-4">
                      {group.h3.map((subHeading) => (
                        <button
                          key={subHeading.id}
                          onClick={() => scrollToHeading(subHeading.id)}
                          className={`text-xs cursor-pointer hover:underline text-left rounded px-2 py-1 transition-colors ${
                            activeHeadingId === subHeading.id
                              ? "text-blue-500 bg-blue-50 dark:bg-blue-500/15 dark:text-blue-300"
                              : "text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {subHeading.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>
          </aside>
        )}
      </div>
      <div className="flex flex-col md:flex-row gap-4 w-full my-4">
        {previousPage && (
          <Link
            href={`/posts/${encodeURIComponent(
              lowerURL(
                categories.find((cat) => cat.id === previousPage.category_id)
                  ?.name || lowerURL(category?.name || ""),
              ),
            )}/${previousPage.id}`}
            className="bg-gray-50 dark:bg-zinc-900 p-container rounded-container flex-1 w-full max-w-full md:max-w-[50%] border border-gray-300 dark:border-white/10"
          >
            <div className="flex gap-4 items-center justify-between">
              <ArrowLeftCircle size={34} className="text-gray-500" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-right">이전 게시물</p>
                <p className="truncate max-w-[200px] overflow-hidden text-ellipsis text-right font-bold">
                  {previousPage.title}
                </p>
              </div>
            </div>
          </Link>
        )}
        {nextPage && (
          <Link
            href={`/posts/${encodeURIComponent(
              lowerURL(
                categories.find((cat) => cat.id === nextPage.category_id)
                  ?.name || lowerURL(category?.name || ""),
              ),
            )}/${nextPage.id}`}
            className="bg-gray-50 dark:bg-zinc-900 p-container rounded-container flex-1 w-full max-w-full md:max-w-[50%] border border-gray-300 dark:border-white/10"
          >
            <div className="flex gap-4 items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm text-gray-700 dark:text-gray-300">다음 게시물</p>
                <p className="truncate leading-tight max-w-[200px] overflow-hidden text-ellipsis font-bold">
                  {nextPage.title}
                </p>
              </div>
              <ArrowRightCircle size={34} className="text-gray-500" />
            </div>
          </Link>
        )}
      </div>
      <div className="flex justify-center gap-2">
        <Button
          onClick={handleHeartClick}
          className={cn(
            `flex items-center gap-1 border rounded-button transition-colors ${
              isHeartClicked
                ? "border-like-border bg-like-bg text-like-foreground"
                : "border-gray-300 dark:border-white/15 text-gray-700 dark:text-gray-200 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800"
            }`,
          )}
        >
          <Heart
            size={20}
            className={cn(
              isHeartClicked ? "fill-like stroke-like" : "currentColor",
            )}
          />
          {post?.like_count}
        </Button>
        <Button
          onClick={handleShare}
          variant="outline"
          className="flex items-center gap-1 rounded-button border-gray-300 bg-white text-gray-700 transition-colors hover:bg-gray-50 dark:border-white/15 dark:bg-zinc-900 dark:text-gray-200 dark:hover:bg-zinc-800"
        >
          <Share2Icon size={20} />
          공유
        </Button>
      </div>
      <Link href="/profile">
        <div className="flex items-center justify-between gap-4 py-6 border-t border-gray-200 dark:border-white/10 mt-4 hover:cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full overflow-hidden shadow-md flex-shrink-0">
              <Image
                src={authorProfile?.profile_image || "/default.png"}
                alt="작성자 프로필"
                width={80}
                height={80}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-metricsText tracking-wider">
                작성자
              </span>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {authorProfile?.nickname || "(알 수 없음)"}
              </p>
            </div>
          </div>
        </div>
      </Link>
      <div className="flex flex-col gap-4 py-4">
        <div className="flex justify-between items-center">
          <span className="font-bold">{publicCommentCount}개의 댓글</span>
        </div>
        <Textarea
          className="w-full min-h-40 resize-none p-container border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 dark:text-gray-100 rounded"
          placeholder={
            session
              ? "댓글을 입력하세요. (최대 1000자)"
              : "로그인을 한 후 이용 가능합니다."
          }
          value={comment}
          onChange={(e) => {
            if (e.target.value.length > 1000)
              alert("최대 1000자까지 입력 가능합니다.");
            setComment(e.target.value);
          }}
          disabled={!session}
          maxLength={1000}
        />
        <div className="flex gap-2 justify-end">
          {session ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsStatus((prev) => !prev)}
                className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-zinc-700"
              >
                {isStatus ? (
                  <>
                    <EyeIcon /> 공개
                  </>
                ) : (
                  <>
                    <EyeOffIcon /> 비공개
                  </>
                )}
              </Button>
              <Button
                className="flex gap-2 w-auto p-button bg-action text-action-foreground hover:bg-action-hover rounded-button"
                onClick={handleSubmitReply}
              >
                <SendIcon size={20} />
                등록
              </Button>
            </>
          ) : (
            <Button
              onClick={openLogin}
              className="bg-action text-action-foreground hover:bg-action-hover rounded-button"
            >
              로그인 하러 가기
            </Button>
          )}
        </div>
      </div>
      {comments.length > 0 ? (
        comments
          .filter((comment) => !comment?.parent_id)
          .map((comment) => (
            <div
              key={comment.id}
              className="flex flex-col gap-2 border-b border-gray-200 dark:border-white/10 py-container last:border-b-0"
            >
              {canViewComment(comment) && (
                <div className="flex items-center gap-4">
                  <div className="object-cover w-10 h-10 rounded-button overflow-hidden">
                    <Image
                      src={
                        comment.profile_image
                          ? decodeURIComponent(comment.profile_image)
                          : "/default.png"
                      }
                      alt="profile"
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <span
                        className={`flex items-center gap-2 font-semibold ${
                          comment.author_id === post?.author_id
                            ? "font-normal text-[12px] bg-black dark:bg-white dark:text-black rounded-full text-white px-2 py-1"
                            : ""
                        }`}
                      >
                        {comment.author_name}
                      </span>
                      {comment.status && <LockIcon size={16} />}
                    </div>
                    <span className="text-[14px] text-metricsText">
                      {formatDate(comment.created_at)}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col">
                {editingCommentId === comment.id ? (
                  <div className="flex flex-col gap-2">
                    <Textarea
                      className="w-full min-h-28 resize-none p-container border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 dark:text-gray-100 rounded"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      maxLength={1000}
                    />
                    <div className="flex flex-wrap gap-2 justify-end">
                      <Button
                        variant="outline"
                        onClick={() => setEditingStatus(!editingStatus)}
                        className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      >
                        {editingStatus ? (
                          <>
                            <EyeOffIcon /> 비공개
                          </>
                        ) : (
                          <>
                            <EyeIcon /> 공개
                          </>
                        )}
                      </Button>
                      <Button variant="ghost" onClick={cancelEditingComment}>
                        취소
                      </Button>
                      <Button
                        onClick={() => handleUpdateComment(Number(comment.id))}
                        disabled={updateCommentMutation.isPending}
                        className="bg-action text-action-foreground hover:bg-action-hover"
                      >
                        수정 완료
                      </Button>
                    </div>
                  </div>
                ) : canViewComment(comment) ? (
                  <p>{comment.content}</p>
                ) : (
                  <div className="flex items-center gap-2 italic">
                    비공개 댓글입니다
                  </div>
                )}
                {session && (
                  <div className="flex gap-2 justify-start">
                    {canViewComment(comment) && editingCommentId !== comment.id && (
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={() => toggleReply(Number(comment.id))}
                      >
                        {replyingTo === comment.id ? "답장 취소" : "답장하기"}
                      </Button>
                    )}
                    {session?.user.id === comment.author_id && editingCommentId !== comment.id && (
                      <>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
                          onClick={() => handleStartEditComment(comment)}
                        >
                          <PencilIcon size={14} />
                          수정하기
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-red-600 dark:hover:text-red-400"
                          onClick={() => deleteHandleComment(Number(comment.id))}
                        >
                          삭제하기
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
              {replyingTo === comment.id && (
                <div className="flex flex-col border-l rounded-container border border-gray-200 dark:border-white/10 overflow-hidden">
                  <Textarea
                    className="w-full min-h-40 resize-none p-container border-none rounded-none bg-white dark:bg-zinc-900 dark:text-gray-100"
                    placeholder="답글을 입력하세요"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <div className="flex gap-2 justify-end p-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsReplyStatus((prev) => !prev)}
                      className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    >
                      {isReplyStatus ? (
                        <>
                          <EyeIcon /> 공개
                        </>
                      ) : (
                        <>
                          <EyeOffIcon /> 비공개
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() =>
                        handleSubmitSubCommment(Number(comment.id))
                      }
                      className="flex items-center gap-2 bg-action text-action-foreground hover:bg-action-hover"
                    >
                      <SendIcon size={20} />
                      등록
                    </Button>
                  </div>
                </div>
              )}

              {/* 대댓글 렌더링 */}
              <div>
                {comments
                  .filter((reply) => reply.parent_id === comment.id)
                  .map((reply) => (
                    <div
                      key={reply.id}
                      className="flex flex-col gap-2 p-container border-b border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 last:border-b-0"
                    >
                      {canViewComment(reply) && (
                        <div className="flex items-center gap-4">
                          <div className="object-cover w-10 h-10 rounded-button overflow-hidden">
                            <Image
                              src={
                                reply.profile_image
                                  ? decodeURIComponent(reply.profile_image)
                                  : "/default.png"
                              }
                              alt="profile"
                              width={40}
                              height={40}
                              className="object-cover"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1">
                              <span
                                className={`flex items-center gap-2 font-semibold ${
                                  reply.author_id === post?.author_id
                                    ? "font-normal text-[12px] bg-black dark:bg-white dark:text-black rounded-full text-white px-2 py-1"
                                    : ""
                                }`}
                              >
                                {reply.author_name}
                              </span>
                              {isAdmin && (
                                <BadgeCheck
                                  size={22}
                                  className="fill-[#0075ff] text-white rounded-full"
                                />
                              )}
                              {reply.status && <LockIcon size={16} />}
                            </div>
                            <span className="text-[14px] text-metricsText">
                              {formatDate(reply.created_at)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col">
                        {editingCommentId === reply.id ? (
                          <div className="flex flex-col gap-2">
                            <Textarea
                              className="w-full min-h-28 resize-none p-container border border-gray-200 dark:border-white/10 bg-white dark:bg-zinc-900 dark:text-gray-100 rounded"
                              value={editingContent}
                              onChange={(e) => setEditingContent(e.target.value)}
                              maxLength={1000}
                            />
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Button
                                variant="outline"
                                onClick={() => setEditingStatus(!editingStatus)}
                                className="bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-zinc-700"
                              >
                                {editingStatus ? (
                                  <>
                                    <EyeOffIcon /> 비공개
                                  </>
                                ) : (
                                  <>
                                    <EyeIcon /> 공개
                                  </>
                                )}
                              </Button>
                              <Button variant="ghost" onClick={cancelEditingComment}>
                                취소
                              </Button>
                              <Button
                                onClick={() => handleUpdateComment(Number(reply.id))}
                                disabled={updateCommentMutation.isPending}
                                className="bg-action text-action-foreground hover:bg-action-hover"
                              >
                                수정 완료
                              </Button>
                            </div>
                          </div>
                        ) : canViewComment(reply) ? (
                          <p>{reply.content}</p>
                        ) : (
                          <div className="flex items-center gap-2 italic">
                            <CornerDownRight size={18} />
                            비공개 댓글입니다
                          </div>
                        )}
                        <div className="flex gap-2 justify-start">
                          {session?.user?.id === reply.author_id && editingCommentId !== reply.id && (
                            <>
                              <Button
                                variant="ghost"
                                className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
                                onClick={() => handleStartEditComment(reply)}
                              >
                                <PencilIcon size={14} />
                                수정하기
                              </Button>
                              <Button
                                variant="ghost"
                                className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-red-600 dark:hover:text-red-400"
                                onClick={() => deleteHandleComment(reply.id)}
                              >
                                삭제하기
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))
      ) : (
        <div className="flex flex-col gap-2 p-container rounded-container border border-gray-200 dark:border-white/10 h-[300px] items-center justify-center">
          <MessageSquareXIcon
            size={48}
            className="text-gray-500 items-center justify-center mx-auto"
          />
          <p className="text-center text-gray-500 text-lg flex justify-center items-center ">
            댓글이 없습니다.
          </p>
        </div>
      )}
          </div>
        </div>
      </div>
      <GotoTop />
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-container border border-gray-200 bg-white p-5 shadow-xl dark:border-white/10 dark:bg-zinc-950"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-950 dark:text-gray-50">
                게시물 공유
              </h2>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="rounded-full p-1.5 text-metricsText transition hover:bg-gray-100 dark:hover:bg-white/10"
                aria-label="닫기"
              >
                <XIcon size={18} />
              </button>
            </div>
            <p className="mt-2 text-sm text-metricsText">
              아래 링크를 복사해서 게시물을 공유할 수 있습니다.
            </p>
            <div className="mt-4 flex min-w-0 items-center gap-2 rounded-container border border-gray-200 bg-gray-50 p-2 dark:border-white/10 dark:bg-white/5">
              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none"
              />
              <button
                onClick={handleCopyShareUrl}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-button bg-gray-950 px-3 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                <CopyIcon size={14} />
                {copyState === "copied" ? "복사됨" : "복사"}
              </button>
            </div>
          </div>
        </div>
      )}
      <ImageViewer
        images={postImages}
        selectedIndex={selectedImageIndex}
        onClose={() => setSelectedImageIndex(null)}
        onSelect={setSelectedImageIndex}
      />
    </motion.div>
  );
}
