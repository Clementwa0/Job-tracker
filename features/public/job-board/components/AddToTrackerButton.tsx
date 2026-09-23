"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BriefcaseBusiness, Check } from "lucide-react";
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

interface AddToTrackerButtonProps {
  job: PublicJobDetail | PublicJobListItem;
  className?: string;
  size?: "sm" | "default";
}

export default function AddToTrackerButton({ job, className, size = "sm" }: AddToTrackerButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addToTracker, isAdding } = useAddPostingToTracker();
  const [loginOpen, setLoginOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [trackedJobId, setTrackedJobId] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    if (!tokenStorage.isAuthenticated()) return;
    let cancelled = false;
    void jobService.getJobsPaginated({ jobPostingId: job.id, limit: 1 })
      .then(({ jobs }) => {
        if (!cancelled) setTrackedJobId(jobs[0]?.id || null);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [job.id]);

  useEffect(() => {
    if (!tokenStorage.isAuthenticated() || searchParams.get("track") !== "1") return;
    queueMicrotask(() => setConfirmOpen(true));
    const cleanUrl = pathname || `/job-board/${job.slug}`;
    router.replace(cleanUrl);
  }, [job.slug, pathname, router, searchParams]);

  const start = () => {
    if (trackedJobId) {
      setRemoveOpen(true);
      return;
    }
    if (!tokenStorage.isAuthenticated()) {
      setLoginOpen(true);
      return;
    }
    setConfirmOpen(true);
  };

  const login = () => {
    const returnTo = `${pathname || `/job-board/${job.slug}`}?track=1`;
    router.push(`/login?redirect=${encodeURIComponent(returnTo)}`);
  };

  const confirm = async () => {
    try {
      const created = await addToTracker(job);
      setTrackedJobId(created.id);
      setConfirmOpen(false);
      toast.success("Job added to your tracker.");
    } catch (error) {
      const message = getApiErrorMessage(error);
      if (message.toLowerCase().includes("already tracking")) {
        const { jobs } = await jobService.getJobsPaginated({ jobPostingId: job.id, limit: 1 });
        setTrackedJobId(jobs[0]?.id || "tracked");
        setConfirmOpen(false);
        toast.success("This job is already in your tracker.");
      } else {
        toast.error("Couldn't add job to tracker", { description: message });
      }
    }
  };

  const remove = async () => {
    if (!trackedJobId || isRemoving) return;
    try {
      setIsRemoving(true);
      await jobService.deleteJob(trackedJobId);
      setTrackedJobId(null);
      setRemoveOpen(false);
      toast.success("Job removed from your tracker.");
    } catch (error) {
      toast.error("Couldn't remove job from tracker", {
        description: getApiErrorMessage(error),
      });
    } finally {
      setIsRemoving(false);
    }
  };

  const company = job.company?.name || "Company";
  const tracked = !!trackedJobId;
  const label = tracked ? "✓ Added to Tracker" : "Add to Tracker";

  return (
    <>
      <Button
        type="button"
        size={size}
        variant={tracked ? "outline" : "secondary"}
        className={className}
        onClick={start}
        disabled={isAdding || isRemoving}
        aria-label={tracked ? `Added ${job.title} to tracker` : `Add ${job.title} to tracker`}
      >
        {tracked ? <Check /> : <BriefcaseBusiness />}
        {isAdding ? "Adding…" : label}
      </Button>

      <Dialog open={loginOpen} onOpenChange={setLoginOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Sign in to track this job</DialogTitle>
            <DialogDescription>
              Log in to your JobTrail account to save this job to your tracker.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setLoginOpen(false)}>Cancel</Button>
            <Button type="button" onClick={login}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add to your tracker?</DialogTitle>
            <DialogDescription>
              Add {job.title} at {company} to your JobTrail tracker?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button type="button" onClick={() => void confirm()} disabled={isAdding}>
              {isAdding ? "Adding…" : "Add to Tracker"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Remove from your tracker?</DialogTitle>
            <DialogDescription>
              Remove {job.title} at {company} from your JobTrail tracker?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRemoveOpen(false)} disabled={isRemoving}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={() => void remove()} disabled={isRemoving}>
              {isRemoving ? "Removing…" : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}