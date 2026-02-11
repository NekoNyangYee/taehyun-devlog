import Image from "next/image";
import Link from "next/link";
import { Grid2X2Plus } from "lucide-react";
import { Category } from "@components/types/category";
import { lowerURL } from "@components/lib/util/lowerURL";

/**
 * 카테고리 그리드 컴포넌트 (Presentational)
 * - 카테고리 목록을 그리드로 표시
 * - 순수하게 화면만 렌더링
 */
interface CategoryGridProps {
    categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
    return (
        <section className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h2 className="flex gap-3 text-3xl md:text-4xl font-bold items-center">
                    <Grid2X2Plus size={32} className="text-blue-600" />
                    카테고리
                </h2>
                <p className="text-metricsText text-sm md:text-base">
                    주제별로 게시물을 탐색해보세요
                </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {categories.map((category) => {
                    const imageUrl = category?.thumbnail;
                    const categoryLink = lowerURL(category.name);

                    return (
                        <Link key={category.id} href={`/posts/${categoryLink}`}>
                            <div className="group relative h-32 sm:h-40 overflow-hidden rounded-2xl shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border border-containerColor/50">
                                <Image
                                    src={imageUrl}
                                    alt={category.name}
                                    fill
                                    quality={65}
                                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex items-end justify-start p-4">
                                    <span className="text-white font-bold text-base sm:text-lg leading-tight">
                                        {category.name}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
