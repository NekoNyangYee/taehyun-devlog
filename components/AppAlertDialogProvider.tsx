"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@components/components/ui/alert-dialog";
import {
  CircleCheckIcon,
  CircleHelpIcon,
  CircleXIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react";

type DialogType = "info" | "success" | "warning" | "error" | "confirm";

type DialogOptions = {
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  type?: DialogType;
};

type DialogRequest = Omit<DialogOptions, "type"> & {
  kind: "alert" | "confirm";
  type: DialogType;
  resolve: (confirmed: boolean) => void;
};

type AlertDialogContextValue = {
  showAlert: (options: string | DialogOptions) => Promise<void>;
  showConfirm: (options: string | DialogOptions) => Promise<boolean>;
};

const AlertDialogContext = createContext<AlertDialogContextValue | null>(null);

const DIALOG_VISUALS = {
  info: {
    icon: InfoIcon,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-400/10 dark:text-blue-300",
  },
  success: {
    icon: CircleCheckIcon,
    className:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-300",
  },
  warning: {
    icon: TriangleAlertIcon,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-400/10 dark:text-amber-300",
  },
  error: {
    icon: CircleXIcon,
    className: "bg-red-50 text-red-600 dark:bg-red-400/10 dark:text-red-300",
  },
  confirm: {
    icon: CircleHelpIcon,
    className: "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-200",
  },
} satisfies Record<DialogType, { icon: typeof InfoIcon; className: string }>;

const normalizeOptions = (
  options: string | DialogOptions,
  kind: DialogRequest["kind"],
): DialogOptions =>
  typeof options === "string"
    ? {
        title: kind === "alert" ? "알림" : "확인",
        description: options,
      }
    : options;

export function AppAlertDialogProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<DialogRequest | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const isClosingRef = useRef(false);
  const closeResultRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showAlert = useCallback(
    (options: string | DialogOptions) =>
      new Promise<void>((resolve) => {
        const normalized = normalizeOptions(options, "alert");
        isClosingRef.current = false;
        setDialog({
          ...normalized,
          kind: "alert",
          type: normalized.type || "info",
          resolve: () => resolve(),
        });
        setIsOpen(true);
      }),
    [],
  );

  const showConfirm = useCallback(
    (options: string | DialogOptions) =>
      new Promise<boolean>((resolve) => {
        const normalized = normalizeOptions(options, "confirm");
        isClosingRef.current = false;
        setDialog({
          ...normalized,
          kind: "confirm",
          type: normalized.type || "confirm",
          resolve,
        });
        setIsOpen(true);
      }),
    [],
  );

  const completeClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    if (dialog && isClosingRef.current) {
      dialog.resolve(closeResultRef.current);
      setDialog(null);
      isClosingRef.current = false;
    }
  }, [dialog]);

  const beginClose = useCallback(
    (confirmed: boolean) => {
      if (!dialog || isClosingRef.current) return;

      isClosingRef.current = true;
      closeResultRef.current = confirmed;
      setIsOpen(false);
      closeTimerRef.current = setTimeout(completeClose, 300);
    },
    [completeClose, dialog],
  );

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    [],
  );

  const value = useMemo(
    () => ({ showAlert, showConfirm }),
    [showAlert, showConfirm],
  );
  const visual = DIALOG_VISUALS[dialog?.type || "info"];
  const DialogIcon = visual.icon;

  return (
    <AlertDialogContext.Provider value={value}>
      {children}
      <AlertDialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) beginClose(false);
        }}
      >
        <AlertDialogContent
          onAnimationEnd={(event) => {
            if (
              event.currentTarget === event.target &&
              event.currentTarget.dataset.state === "closed"
            ) {
              completeClose();
            }
          }}
        >
          <AlertDialogHeader className="flex-row items-start gap-4">
            <span
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visual.className}`}
              aria-hidden="true"
            >
              <DialogIcon size={22} />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <AlertDialogTitle>
                {dialog?.title || (dialog?.kind === "confirm" ? "확인" : "알림")}
              </AlertDialogTitle>
              <AlertDialogDescription className="mt-1.5">
                {dialog?.description}
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {dialog?.kind === "confirm" && (
              <AlertDialogCancel onClick={() => beginClose(false)}>
                {dialog.cancelLabel || "취소"}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={() => beginClose(true)}
              className={
                dialog?.variant === "destructive"
                  ? "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500"
                  : undefined
              }
            >
              {dialog?.confirmLabel || "확인"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}

export function useAppAlertDialog() {
  const context = useContext(AlertDialogContext);

  if (!context) {
    throw new Error("useAppAlertDialog must be used within AppAlertDialogProvider");
  }

  return context;
}
