import { createClient } from "@supabase/supabase-js";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true, // ✅ 자동 세션 관리
        autoRefreshToken: true,
    },
    global: {
        fetch: (url, options = {}) => {
            return fetch(url, {
                ...options,
                cache: 'no-store', // Next.js fetch 캐싱 비활성화 (2MB 제한 우회)
            });
        },
    },
});