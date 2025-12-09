"use client";

import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { useToast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { authStore } from "@/lib/auth";

export function GoogleSignInButton() {
  const router = useRouter();
  const t = useTranslations("auth");
  const tCommon = useTranslations("common");
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const login = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        const response = await api.googleAuth(codeResponse.code);
        authStore.getState().setAuth(response);
        toast.success(t("googleSignInSuccess"), {
          description: response.user.email,
          duration: 4000,
        });
        router.push("/");
        router.refresh();
      } catch (error: any) {
        console.error("Google auth error:", error);
        
        // Parse error details
        let title = t("googleSignInFailed");
        let description = t("googleSignInFailed");
        
        if (error?.details?.error) {
          const errorMsg = error.details.error;
          
          // Handle specific error cases
          if (errorMsg.includes("redirect_uri_mismatch") || errorMsg.includes("configuration error")) {
            description = t("googleConfigError");
          } else if (errorMsg.includes("invalid_grant") || errorMsg.includes("expired")) {
            description = t("googleSessionExpired");
          } else if (errorMsg.includes("Email not verified")) {
            description = t("googleEmailNotVerified");
          } else if (errorMsg.includes("unauthorized") || error.status === 401) {
            description = t("googleAccessDenied");
          } else if (error.status === 500) {
            description = t("googleServerError");
          } else if (error.status === 429) {
            description = t("googleTooManyAttempts");
          } else {
            description = errorMsg;
          }
        } else if (error?.message) {
          description = error.message;
        }
        
        toast.error(title, {
          description,
          duration: 6000,
          action: {
            label: tCommon("retry"),
            onClick: () => login(),
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google login error:", error);
      
      let description = t("googlePopupBlocked");
      const errorCode = error.error as string;
      
      if (errorCode === "popup_closed_by_user") {
        description = t("googleCancelled");
      } else if (errorCode === "access_denied") {
        description = t("googlePermissionDenied");
      }
      
      toast.error(t("googleSignInFailed"), {
        description,
        duration: 5000,
      });
      setIsLoading(false);
    },
    flow: "auth-code",
  });

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12"
      onClick={() => login()}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("verifying")}
        </div>
      ) : (
        <>
          <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t("googleSignIn")}
        </>
      )}
    </Button>
  );
}
