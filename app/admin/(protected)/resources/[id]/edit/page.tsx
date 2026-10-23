"use client";

import { use } from "react";

import ResourceForm from "@/features/admin/resources/ResourceForm";

export default function EditResourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ResourceForm key={id} resourceId={id} />;
}
