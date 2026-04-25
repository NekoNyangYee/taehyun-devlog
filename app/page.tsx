import HomeContent from "./(home)/_components/HomeContent";
import LoadingWrapper from "./LoadingWrapper";

/**
 * 홈 페이지 (Server Component)
 * - 조립자 역할
 * - Client Component를 렌더링
 */
export default function Home() {
  return (
    <div className="h-full flex flex-col w-full overflow-hidden">
      <LoadingWrapper>
        <HomeContent />
      </LoadingWrapper>
    </div>
  );
}
