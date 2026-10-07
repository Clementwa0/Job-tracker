"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { adminService } from "@/features/admin/services/admin.client";
import { getApiErrorMessage } from "@/lib/apiError";
import type { AdminCompany } from "@/types/admin";

interface AdminCompanyActionsProps {
  company: AdminCompany;
  /** Called after an action finishes so the list can refetch. */
  onChanged: () => void;
}

export default function AdminCompanyActions({ company, onChanged }: AdminCompanyActionsProps) {
  const [busy, setBusy] = useState(false);

  const setStatus = async (status: AdminCompany["status"], success: string) => {
    setBusy(true);
    try {
      await adminService.updateCompanyStatus(company.id, status);
      toast.success(success);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setBusy(false);
      onChanged();
    }
  };

  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {company.status === "pending" && (
        <>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("approved", "Company approved")}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={busy}
            className="text-destructive hover:text-destructive"
            onClick={() => setStatus("suspended", "Company rejected")}
          >
            Reject
          </Button>
        </>
      )}
      {company.status === "approved" && (
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          className="text-destructive hover:text-destructive"
          onClick={() => setStatus("suspended", "Company suspended")}
        >
          Suspend
        </Button>
      )}
      {company.status === "suspended" && (
        <Button size="sm" variant="outline" disabled={busy} onClick={() => setStatus("approved", "Company reinstated")}>
          Reinstate
        </Button>
      )}
    </div>
  );
}
