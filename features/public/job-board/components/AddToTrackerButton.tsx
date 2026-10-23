"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Check, Loader2, LogIn, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/apiError";
import { useAuth } from "@/features/auth/hooks/AuthContext";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { useAddPostingToTracker } from "@/features/jobseeker/jobs/hooks/useAddPostingToTracker";
import type { PublicJobDetail, PublicJobListItem } from "@/types/jobPosting";

type DialogState = "none" | "login" | "confirm" | "remove";
type Status = "checking" | "guest" | "ready" | "adding" | "tracked" | "removing";

const cfg: Record<
  Status,
  { label: string; icon: React.ComponentType<{ className?: string }>; button: string; badge: string }
> = {
  checking: {
    label: "Checking…",
    icon: Loader2,
    button: "border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
    badge: "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400",
  },
  guest: {
    label: "Sign in to track",
    icon: LogIn,
    button: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900",
    badge: "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
  },
  ready: {
    label: "Add to Tracker",
    icon: BriefcaseBusiness,
    button: "border-blue-600 bg-blue-600 text-white hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700",
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  adding: {
    label: "Adding…",
    icon: Loader2,
    button: "cursor-wait border-blue-600 bg-blue-600 text-white opacity-90 dark:border-blue-500 dark:bg-blue-600",
    badge: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300",
  },
  tracked: {
    label: "Untrack",
    icon: Trash2,
    button: "border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300 dark:hover:bg-red-900/60",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  removing: {
    label: "Untracking…",
    icon: Loader2,
    button: "cursor-wait border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
    badge: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/50 dark:text-red-300",
  },
};

interface Props {
  job: PublicJobDetail | PublicJobListItem;
  className?: string;
  size?: "sm" | "default";
}

export default function AddToTrackerButton({ job, className, size = "sm" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToTracker, isAdding } = useAddPostingToTracker();

  const [dialog, setDialog] = useState<DialogState>("none");
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [isTracked, setIsTracked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const { isAuthenticated: authed, isLoading: authLoading } = useAuth();
  const returnPath = pathname || `/job-board/${job.slug}`;
  const company = job.company?.name ?? "Company";

  const lookupTrackedId = useCallback(async () => {
    try {
      const { jobs } = await jobService.getJobsPaginated({ jobPostingId: job.id, limit: 1 });
      return jobs[0]?.id ?? null;
    } catch {
      return null;
    }
  }, [job.id]);

  useEffect(() => {
    if (!authed) {
      setIsChecking(false);
      setTrackedJobId(null);
      setIsTracked(false);
      return;
    }
    let cancelled = false;
    setIsChecking(true);
    void lookupTrackedId().then((id) => {
      if (cancelled) return;
      setTrackedJobId(id);
      setIsTracked(Boolean(id));
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authed, lookupTrackedId]);

  const handledTrackParam = useRef(false);
  useEffect(() => {
    if (!authed || searchParams.get("track") !== "1" || handledTrackParam.current) return;
    handledTrackParam.current = true;
    router.replace(returnPath);
    void lookupTrackedId().then((id) => {
      if (id) {
        setTrackedJobId(id);
        setIsTracked(true);
        toast.success("Already in your tracker.");
      } else {
        setDialog("confirm");
      }
    });
  }, [authed, searchParams, router, returnPath, lookupTrackedId]);

  const handleClick = () => {
    if (authLoading || isChecking || isAdding || isRemoving) return;
    if (isTracked) return setDialog("remove");
    if (!authed) return setDialog("login");
    setDialog("confirm");
  };

  const handleLogin = () => {
    const returnTo = `${returnPath}?track=1`;
    router.push(`/jobseeker/account?redirect=${encodeURIComponent(returnTo)}`);
  };

  const handleConfirm = async () => {
    if (isAdding) return;
    try {
      const created = await addToTracker(job);
      setTrackedJobId(created.id);
      setIsTracked(true);
      setDialog("none");
      toast.success("Added to your tracker.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (message.toLowerCase().includes("already tracking")) {
        const id = await lookupTrackedId();
        setTrackedJobId(id);
        setIsTracked(true);
        setDialog("none");
        toast.success("Already in your tracker.");
      } else {
        toast.error("Couldn't add job", { description: message });
      }
    }
  };

  const handleRemove = async () => {
    if (!trackedJobId || isRemoving) return;
    try {
      setIsRemoving(true);
      await jobService.deleteJob(trackedJobId);
      setTrackedJobId(null);
      setIsTracked(false);
      setDialog("none");
      toast.success("Job untracked.");
    } catch (error) {
      toast.error("Couldn't untrack job", { description: getApiErrorMessage(error) });
    } finally {
      setIsRemoving(false);
    }
  };

  const status: Status = isChecking
    ? "checking"
    : isRemoving
      ? "removing"
      : isAdding
        ? "adding"
        : isTracked
          ? "tracked"
          : !authed
            ? "guest"
            : "ready";

  const { label, icon: Icon, button, badge } = cfg[status];
  const spin = status === "checking" || status === "adding" || status === "removing";

  return (
    <>
      <Button
        type="button"
        size={size}
        variant="outline"
        onClick={handleClick}
        disabled={spin}
        aria-busy={spin}
        aria-label={isTracked ? `Untrack ${job.title}` : `Add ${job.title} to tracker`}
        className={cn("gap-2 border transition-all duration-200", button, className)}
      >
        <Icon className={cn("size-4", spin && "animate-spin")} />
        <span>{label}</span>
      </Button>

      <AlertDialog open={dialog === "login"} onOpenChange={(o) => !o && setDialog("none")}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogIn className="size-5 text-slate-500" />
              Sign in to track
            </AlertDialogTitle>
            <AlertDialogDescription>
              Log in to save <span className="font-medium text-foreground">{job.title}</span> at{" "}
              <span className="font-medium text-foreground">{company}</span> to your tracker.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Badge variant="outline" className={cn("w-fit gap-1", cfg.guest.badge)}>
              <LogIn className="size-3" />
              Sign in required
            </Badge>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogin} className="bg-slate-700 text-white hover:bg-slate-800">
              <LogIn className="mr-2 size-4" />
              Log In
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialog === "confirm"}
        onOpenChange={(o) => !o && !isAdding && setDialog("none")}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <BriefcaseBusiness className="size-5 text-blue-600" />
              Add to tracker?
            </AlertDialogTitle>
            <AlertDialogDescription>Save this job so you can follow up later.</AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Badge variant="outline" className={cn("w-fit max-w-full gap-1.5", cfg.ready.badge)}>
              <BriefcaseBusiness className="size-3 shrink-0" />
              <span className="truncate">{job.title} · {company}</span>
            </Badge>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdding}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isAdding}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirm();
              }}
              className={cn("gap-2", cfg.ready.button)}
            >
              {isAdding ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Adding…
                </>
              ) : (
                <>
                  <BriefcaseBusiness className="size-4" /> Add
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={dialog === "remove"}
        onOpenChange={(o) => !o && !isRemoving && setDialog("none")}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-red-600" />
              Untrack this job?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <span className="font-medium text-foreground">{job.title}</span> at{" "}
              <span className="font-medium text-foreground">{company}</span> and any notes attached to it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div>
            <Badge variant="outline" className={cn("w-fit gap-1", cfg.tracked.badge)}>
              <Check className="size-3" />
              Currently tracked
            </Badge>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemoving}>Keep tracking</AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemoving}
              onClick={(e) => {
                e.preventDefault();
                void handleRemove();
              }}
              className={cn("gap-2", cfg.removing.button)}
            >
              {isRemoving ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Untracking…
                </>
              ) : (
                <>
                  <Trash2 className="size-4" /> Untrack
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}