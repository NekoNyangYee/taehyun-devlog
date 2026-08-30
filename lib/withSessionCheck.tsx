"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@components/lib/supabaseClient";
import { Session } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import PageLoading from "@components/components/loading/PageLoading";
import { useAppAlertDialog } from "@components/components/AppAlertDialogProvider";

interface WithUserProps {
  user: {
    id: string;
    email: string;
  };
}

const withSessionCheck = (
  WrappedComponent: React.ComponentType<WithUserProps>
) => {
  const HOC = () => {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showAlert } = useAppAlertDialog();
    const hasRequestedLogin = useRef(false);

    const getSession = useCallback(async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);
      setLoading(false);
    }, []);

    useEffect(() => {
      getSession();

      const { data: authListener } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
        }
      );

      return () => {
        authListener.subscription.unsubscribe();
      };
    }, [getSession]);

    useEffect(() => {
      if (
        !loading &&
        (!session || !session.user || !session.user.email) &&
        !hasRequestedLogin.current
      ) {
        hasRequestedLogin.current = true;
        void showAlert({
          title: "로그인이 필요합니다",
          description: "로그인 후 이용할 수 있습니다.",
          type: "warning",
        }).then(() => router.push("/"));
      }
    }, [loading, session, router, showAlert]);

    if (loading) {
      return <PageLoading />;
    }

    if (!session || !session.user || !session.user.email) {
      return null;
    }

    const user = {
      id: session.user.id,
      email: session.user.email as string,
    };

    return <WrappedComponent user={user} />;
  };

  // **displayName 추가**: HOC의 이름을 명시적으로 설정
  HOC.displayName = `withSessionCheck(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return HOC;
};

export default withSessionCheck;
