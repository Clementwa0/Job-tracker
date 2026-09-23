"use client";

import { Button } from "@/components/ui/button";
import { setCompanyStatus } from "@/features/admin/dummy/adminDummyStore";
import type { AdminCompany } from "@/types/admin";

export default function AdminCompanyActions({ company }: { company: AdminCompany }) {
  return (
    <div className="flex flex-wrap justify-end gap-1.5">
      {company.status === "pending" && (
        <>
          <Button size="sm" variant="outline" onClick={() => setCompanyStatus(company.id, "approved")}>
            Approve
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            onClick={() => setCompanyStatus(company.id, "suspended")}
          >
            Reject
          </Button>
        </>
      )}
      {company.status === "approved" && (
        <Button
          size="sm"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => setCompanyStatus(company.id, "suspended")}
        >
          Suspend
        </Button>
      )}
      {company.status === "suspended" && (
        <Button size="sm" variant="outline" onClick={() => setCompanyStatus(company.id, "approved")}>
          Reinstate
        </Button>
      )}
    </div>
  );
}
