"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getApiErrorMessage } from "@/lib/apiError";
import { tokenStorage } from "@/lib/security/tokenStorage";
import { jobService } from "@/features/jobseeker/jobs/services/job.client";
import { useAddPostingToTracker } from "@/features/jobseeker/jobs/hooks/useAddPostingToTracker";
import type { PublicJobDetail, PublicJobListItem } from "@/types/jobPosting";

type DialogState = "none" | "login" | "confirm" | "remove";

interface AddToTrackerButtonProps {
  job: PublicJobDetail | PublicJobListItem;
  className?: string;
  size?: "sm" | "default";
}

export default function AddToTrackerButton({
  job,
  className,
  size = "sm",
}: AddToTrackerButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToTracker, isAdding } = useAddPostingToTracker();

  const [dialog, setDialog] = useState<DialogState>("none");
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [isTracked, setIsTracked] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const authed = useMemo(() => tokenStorage.isAuthenticated(), []);
  const returnPath = pathname || `/job-board/${job.slug}`;

  /* ---------- Lookup helper ---------- */
  const lookupTrackedId = useCallback(async (): Promise<string | null> => {
    try {
      const { jobs } = await jobService.getJobsPaginated({
        jobPostingId: job.id,
        limit: 1,
      });
      return jobs[0]?.id ?? null;
    } catch {
      return null;
    }
  }, [job.id]);

  /* ---------- Initial tracked-state check ---------- */
  useEffect(() => {
    if (!authed) return;
    let cancelled = false;
    setIsChecking(true);
    void lookupTrackedId().then((id) => {
      if (cancelled) return;
      setTrackedJobId(id);
      setIsTracked(!!id);
      setIsChecking(false);
    });
    return () => {
      cancelled = true;
    };
  }, [authed, lookupTrackedId]);

  /* ---------- Auto-open confirm on ?track=1 (post-login) ---------- */
  const handledTrackParam = useRef(false);
  useEffect(() => {
    if (!authed) return;
    if (searchParams.get("track") !== "1") return;
    if (handledTrackParam.current) return;
    handledTrackParam.current = true;

    router.replace(returnPath);

    // If already tracked, no confirm needed
    void lookupTrackedId().then((id) => {
      if (id) {
        setTrackedJobId(id);
        setIsTracked(true);
        toast.success("This job is already in your tracker.");
      } else {
        setDialog("confirm");
      }
    });
  }, [authed, searchParams, router, returnPath, lookupTrackedId]);

  /* ---------- Actions ---------- */
  const handleClick = () => {
    if (isTracked) {
      setDialog("remove");
      return;
    }
    if (!authed) {
      setDialog("login");
      return;
    }
    setDialog("confirm");
  };

  const handleLogin = () => {
    const returnTo = `${returnPath}?track=1`;
    router.push(`/jobseeker/account?redirect=${encodeURIComponent(returnTo)}`);
  };

  const handleConfirm = async () => {
    try {
      const created = await addToTracker(job);
      setTrackedJobId(created.id);
      setIsTracked(true);
      setDialog("none");
      toast.success("Job added to your tracker.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (message.toLowerCase().includes("already tracking")) {
        const id = await lookupTrackedId();
        setTrackedJobId(id);
        setIsTracked(true);
        setDialog("none");
        toast.success("This job is already in your tracker.");
      } else {
        toast.error("Couldn't add job to tracker", { description: message });
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
      toast.success("Job removed from your tracker.");
    } catch (error) {
      toast.error("Couldn't remove job from tracker", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsRemoving(false);
    }
  };

  /* ---------- Derived UI ---------- */
  const busy = isAdding || isRemoving || isChecking;
  const label = isChecking
    ? "Checking…"
    : isAdding
    ? "Adding…"
    : isRemoving
    ? "Removing…"
    : isTracked
    ? "Added to Tracker"
    : "Add to Tracker";

  const company = job.company?.name ?? "Company";

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={isTracked ? "outline" : "secondary"}
        className={className}
        onClick={handleClick}
        disabled={busy}
        aria-busy={busy}
        aria-label={
          isTracked
            ? `Remove ${job.title} from tracker`
            : `Add ${job.title} to tracker`
        }
      >
        {isChecking || isAdding || isRemoving ? (
          <Loader2 className="animate-spin" />
        ) : isTracked ? (
          <Check />
        ) : (
          <BriefcaseBusiness />
        )}
        {label}
      </Button>

      <ConfirmDialog
        open={dialog === "login"}
        onOpenChange={(o) => !o && setDialog("none")}
        title="Sign in to track this job"
        description="Log in to your JobTrail account to save this job to your tracker."
        confirmLabel="Log In"
        onConfirm={handleLogin}
      />

      <ConfirmDialog
        open={dialog === "confirm"}
        onOpenChange={(o) => !o && setDialog("none")}
        title="Add to your tracker?"
        description={`Add ${job.title} at ${company} to your JobTrail tracker?`}
        confirmLabel={isAdding ? "Adding…" : "Add to Tracker"}
        onConfirm={() => void handleConfirm()}
        disabled={isAdding}
      />

      <ConfirmDialog
        open={dialog === "remove"}
        onOpenChange={(o) => !o && setDialog("none")}
        title="Remove from your tracker?"
        description={`Remove ${job.title} at ${company} from your JobTrail tracker?`}
        confirmLabel={isRemoving ? "Removing…" : "Remove"}
        onConfirm={() => void handleRemove()}
        disabled={isRemoving}
        destructive
      />
    </>
  );
}

/* ---------- Local helper ---------- */
function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  disabled,
  destructive,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  disabled?: boolean;
  destructive?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}