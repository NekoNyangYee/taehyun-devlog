"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { PostState } from "@components/types/post";
import { useParams, useRouter } from "next/navigation";
import { formatDate } from "@components/lib/util/dayjs";
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
  PencilIcon,
  SendIcon,
  Share2Icon,
  Trash2Icon,
  XIcon,
} from "lucide-react";
import PageLoading from "@components/components/loading/PageLoading";
import { Button } from "@components/components/ui/button";
import { useSessionStore } from "@components/store/sessionStore";
import { cn } from "@components/lib/utils";
import { Textarea } from "@components/components/ui/textarea";
import Image from "next/image";
import noCommentsImage from "../../../../public/no-comments.png";
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
import { useToggleLike } from "@components/queries/postMutations";
import {
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from "@components/queries/commentMutations";
import {
  profileQueryKey,
  fetchProfileQueryFn,
} from "@components/queries/profileQueries";
import MobileTOC from "@components/components/MobileTOC";
import { useLoginModalStore } from "@components/store/loginModalStore";
import { useCommentStore } from "@components/store/commentStore";
import { motion } from "framer-motion";
import { CategoryLabel } from "@components/components/CategoryLabel";

interface Heading {
  id: string;
  text: string;
  tag?: string;
}

interface HeadingGroup {
  h2: Heading;
  h3: Heading[];
}

const JETBRAINS_FILE_ICON_BASE =
  "https://intellij-icons.jetbrains.design/icons/AllIcons/fileTypes";
const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons";

const codeLanguageAliases: Record<string, string> = {
  javascript: "js",
  typescript: "ts",
  py: "python",
  rb: "ruby",
  rs: "rust",
  golang: "go",
  kt: "kotlin",
  cs: "csharp",
  "c++": "cpp",
  sh: "bash",
  shell: "bash",
  zsh: "bash",
  yml: "yaml",
  md: "markdown",
};

const codeExtensionLanguages: Record<string, string> = {
  js: "js",
  jsx: "jsx",
  mjs: "js",
  cjs: "js",
  ts: "ts",
  tsx: "tsx",
  py: "python",
  java: "java",
  kt: "kotlin",
  kts: "kotlin",
  go: "go",
  rs: "rust",
  c: "c",
  h: "c",
  cc: "cpp",
  cpp: "cpp",
  cxx: "cpp",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  swift: "swift",
  html: "html",
  css: "css",
  scss: "scss",
  vue: "vue",
  svelte: "svelte",
  sh: "bash",
  bash: "bash",
  zsh: "bash",
  ps1: "powershell",
  sql: "sql",
  json: "json",
  yaml: "yaml",
  yml: "yaml",
  md: "markdown",
  xml: "xml",
};

const jetbrainsIconNames: Record<string, string> = {
  js: "javaScript",
  jsx: "javaScript",
  java: "java",
  html: "html",
  css: "css",
  scss: "css",
  bash: "shell",
  powershell: "microsoftWindows",
  json: "json",
  yaml: "yaml",
  markdown: "text",
  xml: "xml",
};

const deviconNames: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  jsx: "react",
  tsx: "react",
  python: "python",
  java: "java",
  kotlin: "kotlin",
  go: "go",
  rust: "rust",
  c: "c",
  cpp: "cplusplus",
  csharp: "csharp",
  php: "php",
  ruby: "ruby",
  swift: "swift",
  html: "html5",
  css: "css3",
  scss: "sass",
  vue: "vuejs",
  svelte: "svelte",
  bash: "bash",
  powershell: "powershell",
  sql: "azuresqldatabase",
  json: "json",
  yaml: "yaml",
  markdown: "markdown",
  xml: "xml",
};

function normalizeCodeLanguage(language?: string) {
  const normalized = language?.trim().toLowerCase() || "text";
  return codeLanguageAliases[normalized] || normalized;
}

function getLanguageFromTitle(title?: string) {
  const extension = title?.match(/\.([a-z0-9+#]+)$/i)?.[1].toLowerCase();
  return extension ? codeExtensionLanguages[extension] : undefined;
}

function getDeviconUrl(language: string) {
  const name = deviconNames[language];
  return name ? `${DEVICON_BASE}/${name}/${name}-original.svg` : undefined;
}

const highlightLanguageNames: Record<string, string> = {
  js: "javascript",
  jsx: "javascript",
  ts: "typescript",
  tsx: "typescript",
  text: "plaintext",
};

const copyButtonContent =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><rect x="9" y="9" width="11" height="11" rx="2"></rect><path d="M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3"></path></svg><span>복사</span>';
const copiedButtonContent =
  '<svg aria-hidden="true" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"></path></svg><span>복사됨</span>';

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
function RenderedContent({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    ref.current.innerHTML = html || "";

    // 본문 이미지는 원본 비율로 표시한다.
    ref.current.querySelectorAll("img").forEach((img) => {
      const el = img as HTMLImageElement;
      el.style.display = "block";
      el.style.margin = "20px auto";
      el.style.maxWidth = "100%";
      el.style.height = "auto";
      el.style.cursor = "default";
    });

    // 제목 여백
    ref.current.querySelectorAll("h1, h2, h3").forEach((heading) => {
      const el = heading as HTMLHeadingElement;
      el.style.margin = "1rem 0";
    });

    // DB의 코드 블록 메타데이터를 화면 전용 UI로 변환한다.
    ref.current.querySelectorAll("pre").forEach((pre) => {
      if (pre.parentElement?.classList.contains("code-block")) return;

      const code = pre.querySelector(":scope > code");
      if (!code) return;

      const languageClass = Array.from(code.classList).find((className) =>
        /^(?:language|lang)-/.test(className),
      );
      const classLanguage = languageClass?.replace(/^(?:language|lang)-/, "");
      const title = pre.dataset.title || pre.dataset.filename;
      const language = normalizeCodeLanguage(
        pre.dataset.language || classLanguage || getLanguageFromTitle(title),
      );
      const headerLabel = title || pre.dataset.language || (language === "text" ? "CODE" : language.toUpperCase());

      if (!languageClass) {
        code.classList.add(`language-${highlightLanguageNames[language] || language}`);
      }

      const wrapper = document.createElement("div");
      wrapper.className = "code-block";
      wrapper.dataset.codeBlockEnhanced = "true";

      const toolbar = document.createElement("div");
      toolbar.className = "code-block-toolbar";

      const label = document.createElement("span");
      label.className = "code-block-language";
      label.title = headerLabel;

      const jetbrainsIconName = jetbrainsIconNames[language];
      const deviconUrl = getDeviconUrl(language);
      const primaryIconUrl = jetbrainsIconName
        ? `${JETBRAINS_FILE_ICON_BASE}/${jetbrainsIconName}_dark.svg`
        : deviconUrl;

      if (primaryIconUrl) {
        const icon = document.createElement("img");
        icon.className = "code-block-language-icon";
        icon.src = primaryIconUrl;
        icon.alt = "";
        icon.setAttribute("aria-hidden", "true");
        icon.addEventListener("error", () => {
          if (deviconUrl && icon.src !== deviconUrl) {
            icon.src = deviconUrl;
          } else {
            icon.remove();
          }
        });
        label.append(icon);
      }
      label.append(document.createTextNode(headerLabel));

      const copyButton = document.createElement("button");
      copyButton.type = "button";
      copyButton.className = "code-block-copy";
      copyButton.dataset.codeCopy = "";
      copyButton.setAttribute("aria-label", `${headerLabel} 코드 복사`);
      copyButton.innerHTML = copyButtonContent;

      toolbar.append(label, copyButton);
      pre.before(wrapper);
      wrapper.append(toolbar, pre);
    });

    // 하이라이트
    let attempts = 0;
    const maxAttempts = 10;
    const tryHighlight = () => {
      const hljs = window.hljs;
      if (hljs) {
        ref.current?.querySelectorAll("pre code").forEach((el) => {
          const codeElement = el as HTMLElement;
          if (codeElement.dataset.highlighted !== "yes") {
            hljs.highlightElement(codeElement);
          }
        });
      } else if (++attempts < maxAttempts) {
        setTimeout(tryHighlight, 150);
      }
    };
    tryHighlight();
  }, [html]);

  // 이벤트 위임: 코드 복사 버튼 처리
  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      const copyButton = target.closest<HTMLButtonElement>("[data-code-copy]");

      if (copyButton) {
        const code = copyButton
          .closest(".code-block")
          ?.querySelector("pre code")?.textContent;
        if (code == null) return;

        try {
          await navigator.clipboard.writeText(code);
          copyButton.classList.add("is-copied");
          copyButton.setAttribute("aria-label", "복사 완료");
          copyButton.innerHTML = copiedButtonContent;

          window.setTimeout(() => {
            copyButton.classList.remove("is-copied");
            copyButton.setAttribute("aria-label", "코드 복사");
            copyButton.innerHTML = copyButtonContent;
          }, 1500);
        } catch (error) {
          console.error("코드를 복사하지 못했습니다.", error);
        }
        return;
      }

    },
    [],
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
  const router = useRouter();
  const params = useParams();
  const { id, category: urlCategory } = params;

  const [post, setPost] = useState<PostState | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [comment, setComment] = useState<string>("");
  const [isAdmin] = useState<boolean>(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState<string>("");
  const [isReplyMentionVisible, setIsReplyMentionVisible] =
    useState<boolean>(false);
  const [isStatus, setIsStatus] = useState<boolean>(true);
  const [isReplyStatus, setIsReplyStatus] = useState<boolean>(true);
  const [isNotFound, setIsNotFound] = useState<boolean>(false);
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

  const resolvedPostSlug = Array.isArray(id) ? id[0] : id;
  const hasValidPostSlug =
    typeof resolvedPostSlug === "string" && resolvedPostSlug.length > 0;

  const postDetailQuery = useQuery({
    queryKey: postDetailQueryKey(resolvedPostSlug ?? ""),
    queryFn: () => fetchPostByIdQueryFn(resolvedPostSlug ?? ""),
    enabled: hasValidPostSlug,
  });

  const currentPostId = postDetailQuery.data?.id;
  const currentPostIds =
    typeof currentPostId === "number" ? [currentPostId] : undefined;

  const { data: comments = [] } = useQuery({
    queryKey: commentsQueryKey(currentPostIds, true),
    queryFn: () =>
      fetchCommentsQueryFn(currentPostIds ?? [], { includePrivate: true }),
    enabled: !!currentPostIds,
  });

  // ✅ 게시물 작성자 프로필 가져오기
  const { data: authorProfiles = [] } = useQuery({
    queryKey: profileQueryKey(post?.author_id),
    queryFn: () => fetchProfileQueryFn(post?.author_id),
    enabled: !!post?.author_id,
  });

  const authorProfile = authorProfiles[0];

  // ✅ Mutation hooks
  const toggleLikeMutation = useToggleLike();
  const addCommentMutation = useAddComment(currentPostIds);
  const deleteCommentMutation = useDeleteComment(currentPostIds);
  const updateCommentMutation = useUpdateComment(currentPostIds);

  const isHydratingPost = postDetailQuery.isLoading && !postDetailQuery.data;

  // query state → 로컬 상태 동기화 (setPost/setIsNotFound는 외부 비동기 상태 반영용으로
  // 룰의 의도와 충돌하므로 disable. TanStack Query setQueryData 기반 리팩토링은 별도 작업).
  useEffect(() => {
    if (!postDetailQuery.error) return;
    console.error("게시물 상세 로드 실패:", postDetailQuery.error);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsNotFound(true);
    setLoading(false);
    setPostLoading(false);
  }, [postDetailQuery.error, setPostLoading]);

  useEffect(() => {
    if (!postDetailQuery.data) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPost(postDetailQuery.data);
  }, [postDetailQuery.data]);

  // ✅ URL 카테고리와 실제 게시물 카테고리 검증 (불일치 시 올바른 URL로 replace)
  // 주의: 게시물 전환 중 race condition 방지 위해 post.slug === resolvedPostSlug 일 때만 검증
  useEffect(() => {
    if (!post || categories.length === 0 || !urlCategory) return;
    if (post.slug !== resolvedPostSlug) return; // 이전 게시물 데이터로 잘못 검증되는 것 방지

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
      router.replace(`/articles/${correctSlug}/${post.slug}`);
    }
  }, [post, categories, urlCategory, router, resolvedPostSlug]);

  useEffect(() => {
    setPostLoading(isHydratingPost);
  }, [isHydratingPost, setPostLoading]);

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
    setIsReplyMentionVisible(false);
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
          text: `${post.title} 아티클을 확인해 보세요.`,
          url,
        });
        return;
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
      }
    }

    setShareUrl(url);
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
  const totalCommentCount = comments.length;

  const handleSubmitSubCommment = async (parentId: number) => {
    if (replyContent.trim() === "") {
      alert("답글을 입력하세요.");
      return;
    }

    if (!replyContent || !session?.user || !post?.id) return;

    const author_name: string =
      session?.user?.user_metadata?.full_name || "익명";
    const mentionTarget = comments.find(
      (item) => Number(item.id) === replyingTo,
    );
    const submittedContent =
      mentionTarget && isReplyMentionVisible
        ? `@[${mentionTarget.author_name.replaceAll("]", "")}] ${replyContent}`
        : replyContent;

    await addCommentMutation.mutateAsync({
      author_id: session?.user.id,
      author_name,
      profile_image: session?.user.user_metadata.avatar_url ?? "",
      parent_id: parentId,
      post_id: post?.id,
      content: submittedContent,
      status: !isReplyStatus,
    });

    setReplyContent("");
    setReplyingTo(null);
    setIsReplyMentionVisible(false);
  };

  const replyTarget = comments.find(
    (item) => Number(item.id) === replyingTo,
  );

  const renderCommentContent = (content: string) => {
    const mentionMatch = content.match(/^@\[([^\]]+)\]\s*/);

    if (!mentionMatch) {
      return <p>{content}</p>;
    }

    const body = content.slice(mentionMatch[0].length);

    return (
      <p className="flex flex-wrap items-center gap-2">
        <span className="inline-flex shrink-0 items-center rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-400/10 dark:text-blue-300">
          @{mentionMatch[1]}
        </span>
        {body && <span className="min-w-0 whitespace-pre-wrap">{body}</span>}
      </p>
    );
  };

  const renderReplyComposer = (parentId: number) => (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200 dark:bg-zinc-900 dark:ring-white/10 sm:p-5">
      <div className="flex min-h-32 items-start gap-2">
        {replyTarget && isReplyMentionVisible && (
          <button
            type="button"
            onClick={() => setIsReplyMentionVisible(false)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-400/10 dark:text-blue-300 dark:hover:bg-blue-400/15"
            aria-label="답글 태그 삭제"
          >
            @{replyTarget.author_name}
            <XIcon size={12} />
          </button>
        )}
        <Textarea
          className="min-h-28 min-w-0 flex-1 resize-none rounded-xl border-0 bg-gray-50 p-4 shadow-none focus-visible:ring-1 focus-visible:ring-gray-300 dark:bg-white/[0.05] dark:text-gray-100 dark:focus-visible:ring-white/20"
          placeholder="답글을 입력하세요"
          value={replyContent}
          onChange={(e) => setReplyContent(e.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Backspace" &&
              replyContent.length === 0 &&
              isReplyMentionVisible
            ) {
              event.preventDefault();
              setIsReplyMentionVisible(false);
            }
          }}
        />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            setReplyingTo(null);
            setReplyContent("");
            setIsReplyMentionVisible(false);
          }}
          className="h-10 rounded-xl px-4 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/10"
        >
          취소
        </Button>
        <Button
          variant="outline"
          onClick={() => setIsReplyStatus((prev) => !prev)}
          className="h-10 rounded-xl border-0 bg-gray-100 px-4 text-gray-700 shadow-none hover:bg-gray-200 dark:bg-white/[0.07] dark:text-gray-200 dark:hover:bg-white/10"
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
          onClick={() => handleSubmitSubCommment(parentId)}
          className="flex h-10 items-center gap-2 rounded-xl bg-action px-4 font-semibold text-action-foreground shadow-none hover:bg-action-hover"
        >
          <SendIcon size={20} />
          등록
        </Button>
      </div>
    </div>
  );

  if (loading || isHydratingPost) {
    return <PageLoading />;
  }

  if (isNotFound) {
    return <NotFound />;
  }

  return (
    <motion.div
      className="relative my-6 flex min-w-0 w-full flex-1 flex-col md:my-8"
    >
      {/* 제목 / 카테고리 / 메타 정보 */}
      <header className="flex w-full max-w-4xl flex-col gap-5 py-10 sm:py-14 lg:py-16">
        <CategoryLabel
          name={postCategory(post.category_id)}
          href={category ? `/articles?category=${category.id}` : "/articles"}
          className="self-start"
        />
        <h1 className="text-3xl font-bold leading-[1.35] tracking-[-0.03em] text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-metricsText">
          <span className="flex items-center gap-1.5">
            <CalendarRangeIcon size={16} />
            {formatDate(post.created_at)}
          </span>
        </div>
      </header>

      {/* 본문 영역 */}
      <div className="relative z-10 border-t border-gray-100 pt-8 dark:border-white/10 sm:pt-10">
        <div className="min-h-screen">
          <MobileTOC
            headingGroups={headingGroups}
            activeId={activeHeadingId}
            onScrollTo={scrollToHeading}
          />
          <div className="w-full break-words whitespace-pre-wrap">
      <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-start xl:gap-14">
        <article className="min-w-0 flex-1 py-4 lg:py-0">
          <RenderedContent html={updatedContent || post?.contents || ""} />
        </article>
        {headingGroups.length > 0 && (
          <aside className="hidden max-h-[calc(100vh-7rem)] w-[18rem] shrink-0 self-start overflow-hidden rounded-3xl bg-gray-100/80 dark:bg-white/[0.06] lg:sticky lg:top-24 lg:flex lg:flex-col">
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="flex min-h-14 items-center px-5 text-base font-bold text-gray-950 dark:text-white">
                목차
              </div>
              <nav className="flex flex-col">
              {headingGroups.map((group, index) => (
                <div key={group.h2.id} className="flex flex-col">
                  <button
                    onClick={() => scrollToHeading(group.h2.id)}
                    className={`mx-2 cursor-pointer rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-gray-200/70 dark:hover:bg-white/10 ${
                      activeHeadingId === group.h2.id
                        ? "text-blue-500 dark:text-blue-300"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {`${index + 1}. ${group.h2.text}`}
                  </button>
                  {group.h3.length > 0 && (
                    <div className="ml-2 flex flex-col">
                      {group.h3.map((subHeading) => (
                        <button
                          key={subHeading.id}
                          onClick={() => scrollToHeading(subHeading.id)}
                          className={`mx-2 cursor-pointer rounded-lg px-3 py-2 text-left text-xs transition-colors hover:bg-gray-200/70 dark:hover:bg-white/10 ${
                            activeHeadingId === subHeading.id
                              ? "text-blue-500 dark:text-blue-300"
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
            </div>
            <div className="mt-2 shrink-0 px-2 pb-2">
              <GotoTop variant="toc" />
            </div>
          </aside>
        )}
      </div>
      <div className="mt-12 grid w-full gap-3 md:grid-cols-2">
        {previousPage && (
          <Link
            href={`/articles/${encodeURIComponent(
              lowerURL(
                categories.find((cat) => cat.id === previousPage.category_id)
                  ?.name || lowerURL(category?.name || ""),
              ),
            )}/${previousPage.slug}`}
            className="min-w-0 rounded-2xl bg-gray-100 px-5 py-4 transition-colors hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10 md:col-start-1"
          >
            <div className="flex gap-4 items-center justify-between">
              <ArrowLeftCircle size={34} className="text-gray-500" />
              <div className="flex flex-col">
                <p className="text-sm text-gray-700 dark:text-gray-300 text-right">이전 아티클</p>
                <p className="truncate max-w-[200px] overflow-hidden text-ellipsis text-right font-bold">
                  {previousPage.title}
                </p>
              </div>
            </div>
          </Link>
        )}
        {nextPage && (
          <Link
            href={`/articles/${encodeURIComponent(
              lowerURL(
                categories.find((cat) => cat.id === nextPage.category_id)
                  ?.name || lowerURL(category?.name || ""),
              ),
            )}/${nextPage.slug}`}
            className="min-w-0 rounded-2xl bg-gray-100 px-5 py-4 transition-colors hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10 md:col-start-2"
          >
            <div className="flex gap-4 items-center justify-between">
              <div className="flex flex-col">
                <p className="text-sm text-gray-700 dark:text-gray-300">다음 아티클</p>
                <p className="truncate leading-tight max-w-[200px] overflow-hidden text-ellipsis font-bold">
                  {nextPage.title}
                </p>
              </div>
              <ArrowRightCircle size={34} className="text-gray-500" />
            </div>
          </Link>
        )}
      </div>
      <div className="flex justify-center gap-2 py-8">
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
      <Link href="/profile" className="mt-4 block rounded-3xl bg-gray-100 transition-colors hover:bg-gray-200 dark:bg-white/[0.06] dark:hover:bg-white/10">
        <div className="flex items-center justify-between gap-4 px-5 py-6 hover:cursor-pointer md:px-7">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
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
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-[-0.02em] text-gray-950 dark:text-white">
            댓글 {totalCommentCount}
          </h2>
        </div>

        <div className="mt-8">
          {session ? (
            <div className="flex items-center gap-3">
              <Image
                src={session.user.user_metadata?.avatar_url || "/default.png"}
                alt="댓글 작성자 프로필"
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
              <div className="flex h-12 min-w-0 flex-1 items-center justify-between gap-3 px-1">
                <span className="min-w-0 truncate text-sm font-bold text-gray-900 dark:text-gray-100">
                  {session.user.user_metadata?.full_name ||
                    session.user.user_metadata?.name ||
                    "사용자"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsStatus((prev) => !prev)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-950 dark:bg-white/10 dark:text-gray-300 dark:hover:bg-white/15 dark:hover:text-white"
                >
                  {isStatus ? <EyeIcon size={14} /> : <EyeOffIcon size={14} />}
                  {isStatus ? "공개" : "비공개"}
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={openLogin}
              className="h-12 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground transition-colors hover:bg-action-hover"
            >
              로그인하고 댓글 남기기
            </button>
          )}

          <Textarea
            className="mt-4 min-h-36 w-full resize-y rounded-2xl border border-gray-200 bg-white px-4 py-4 text-sm leading-6 shadow-none placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus-visible:ring-white/20"
            placeholder={
              session
                ? "댓글을 입력하세요. (최대 1000자)"
                : "로그인하면 댓글을 남길 수 있어요."
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

          {session && (
            <div className="mt-4 flex justify-end">
              <Button
                className="h-11 rounded-xl bg-action px-5 text-sm font-semibold text-action-foreground transition-colors hover:bg-action-hover"
                onClick={handleSubmitReply}
              >
                댓글 남기기
              </Button>
            </div>
          )}
        </div>
      </section>
      {comments.length > 0 ? (
        comments
          .filter((comment) => !comment?.parent_id)
          .map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "mt-6 flex flex-col overflow-hidden rounded-2xl bg-gray-50 dark:bg-white/[0.04]",
                session &&
                  canViewComment(comment) &&
                  editingCommentId !== comment.id &&
                  "cursor-pointer",
              )}
              onClick={(event) => {
                const target = event.target as HTMLElement;

                if (
                  !session ||
                  !canViewComment(comment) ||
                  editingCommentId === comment.id ||
                  target.closest("button, a, textarea, input")
                ) {
                  return;
                }

                setReplyingTo(Number(comment.id));
                setIsReplyMentionVisible(true);
              }}
            >
              {canViewComment(comment) && (
                <div className="flex items-start justify-between gap-4 px-5 pt-5 md:px-8 md:pt-6">
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
                  {session?.user.id === comment.author_id &&
                    editingCommentId !== comment.id && (
                      <div className="flex shrink-0 items-start gap-2">
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
                          onClick={() => handleStartEditComment(comment)}
                        >
                          <PencilIcon size={14} />
                          수정
                        </Button>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-red-600 dark:hover:text-red-400"
                          onClick={() =>
                            deleteHandleComment(Number(comment.id))
                          }
                        >
                          <Trash2Icon size={14} />
                          삭제
                        </Button>
                      </div>
                    )}
                </div>
              )}

              <div
                className={cn(
                  "flex min-w-0 flex-col px-5 pb-5 md:px-8 md:pb-6",
                  canViewComment(comment) &&
                    "pl-[76px] md:pl-[88px]",
                )}
              >
                {editingCommentId === comment.id ? (
                  <div className="overflow-hidden border border-gray-200 dark:border-white/10">
                    <Textarea
                      className="w-full min-h-28 resize-none rounded-none border-0 bg-white p-container dark:bg-zinc-900 dark:text-gray-100"
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      maxLength={1000}
                    />
                    <div className="flex flex-wrap justify-end border-t border-gray-200 dark:border-white/10">
                      <Button
                        variant="outline"
                        onClick={() => setEditingStatus(!editingStatus)}
                        className="rounded-none border-y-0 border-l border-r-0 border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-white/10 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
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
                      <Button
                        variant="ghost"
                        className="rounded-none border-l border-gray-200 dark:border-white/10"
                        onClick={cancelEditingComment}
                      >
                        취소
                      </Button>
                      <Button
                        onClick={() => handleUpdateComment(Number(comment.id))}
                        disabled={updateCommentMutation.isPending}
                        className="rounded-none border-l border-gray-200 bg-action text-action-foreground hover:bg-action-hover dark:border-white/10"
                      >
                        저장
                      </Button>
                    </div>
                  </div>
                ) : canViewComment(comment) ? (
                  renderCommentContent(comment.content)
                ) : (
                  <div className="flex items-center gap-2 italic">
                    비공개 댓글입니다
                  </div>
                )}
              </div>
              <div className="mx-4 mb-4 flex flex-col gap-3 sm:mx-5 md:ml-20 md:mr-6 md:mb-6">
                {replyingTo === comment.id && (
                  <div>
                    {renderReplyComposer(Number(comment.id))}
                  </div>
                )}

                {/* 대댓글 렌더링 */}
                {comments
                  .filter((reply) => reply.parent_id === comment.id)
                  .map((reply) => (
                    <div
                      key={reply.id}
                      className={cn(
                        "relative",
                        session &&
                          canViewComment(reply) &&
                          editingCommentId !== reply.id &&
                          "cursor-pointer",
                      )}
                      onClick={(event) => {
                        event.stopPropagation();
                        const target = event.target as HTMLElement;

                        if (
                          !session ||
                          !canViewComment(reply) ||
                          editingCommentId === reply.id ||
                          target.closest("button, a, textarea, input")
                        ) {
                          return;
                        }

                        setReplyingTo(Number(reply.id));
                        setIsReplyMentionVisible(true);
                      }}
                    >
                      <div
                        className={cn(
                          "flex flex-col gap-3 rounded-2xl bg-white p-4 ring-1 ring-gray-200 dark:bg-white/[0.035] dark:ring-white/10 sm:p-5",
                        )}
                      >
                      <CornerDownRight
                        size={18}
                        aria-hidden="true"
                        className="absolute -left-7 top-5 hidden text-gray-400 md:block dark:text-gray-500"
                      />
                      {canViewComment(reply) && (
                        <div className="flex items-start justify-between gap-4">
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
                          {session?.user?.id === reply.author_id &&
                            editingCommentId !== reply.id && (
                              <div className="flex shrink-0 items-start gap-2">
                                <Button
                                  variant="ghost"
                                  className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-gray-900 dark:hover:text-gray-100"
                                  onClick={() => handleStartEditComment(reply)}
                                >
                                  <PencilIcon size={14} />
                                  수정
                                </Button>
                                <Button
                                  variant="ghost"
                                  className="p-0 h-auto text-metricsText hover:bg-transparent hover:text-red-600 dark:hover:text-red-400"
                                  onClick={() => deleteHandleComment(reply.id)}
                                >
                                  <Trash2Icon size={14} />
                                  삭제
                                </Button>
                              </div>
                            )}
                        </div>
                      )}

                      <div
                        className={cn(
                          "flex min-w-0 flex-col",
                          canViewComment(reply) && "ml-0 sm:ml-14",
                        )}
                      >
                        {editingCommentId === reply.id ? (
                            <div className="overflow-hidden border border-gray-200 dark:border-white/10">
                              <Textarea
                                className="w-full min-h-28 resize-none rounded-none border-0 bg-white p-container dark:bg-zinc-900 dark:text-gray-100"
                                value={editingContent}
                                onChange={(e) => setEditingContent(e.target.value)}
                                maxLength={1000}
                              />
                              <div className="flex flex-wrap justify-end border-t border-gray-200 dark:border-white/10">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingStatus(!editingStatus)}
                                  className="rounded-none border-y-0 border-l border-r-0 border-gray-200 bg-gray-100 text-gray-700 hover:bg-gray-200 dark:border-white/10 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700"
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
                              <Button
                                variant="ghost"
                                className="rounded-none border-l border-gray-200 dark:border-white/10"
                                onClick={cancelEditingComment}
                              >
                                취소
                              </Button>
                              <Button
                                onClick={() => handleUpdateComment(Number(reply.id))}
                                disabled={updateCommentMutation.isPending}
                                className="rounded-none border-l border-gray-200 bg-action text-action-foreground hover:bg-action-hover dark:border-white/10"
                              >
                                저장
                              </Button>
                            </div>
                          </div>
                        ) : canViewComment(reply) ? (
                          renderCommentContent(reply.content)
                        ) : (
                          <div className="flex items-center gap-2 italic">
                            <CornerDownRight size={18} />
                            비공개 댓글입니다
                          </div>
                        )}
                      </div>
                      </div>
                      {replyingTo === reply.id && (
                        <div>
                          {renderReplyComposer(Number(comment.id))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))
      ) : (
        <div className="flex h-[300px] flex-col items-center justify-center gap-2">
          <Image
            src={noCommentsImage}
            alt="아직 댓글이 없는 상태"
            quality={75}
            className="h-auto w-48 sm:w-56"
            sizes="(max-width: 640px) 192px, 224px"
          />
          <p className="mt-2 text-center text-lg font-semibold text-gray-800 dark:text-gray-200">
            아직 첫 댓글을 기다리고 있어요.
          </p>
          <p className="text-center text-sm text-metricsText">
            아티클에 대한 생각을 편하게 남겨보세요.
          </p>
        </div>
      )}
          </div>
        </div>
      </div>
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
                아티클 공유
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
              아래 링크를 복사해서 아티클을 공유할 수 있습니다.
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
    </motion.div>
  );
}
