import { memo } from "react";
import type { ResumeData } from "@/types/resume-builder";
import { AuroraTemplate, AtlasTemplate, VertexTemplate, HorizonTemplate, MonoTemplate, ImpactTemplate } from "./templates";

interface Props { data: ResumeData; }

function ResumePreview({ data }: Props) {
  switch (data.template) {
    case "atlas": return <AtlasTemplate data={data} />;
    case "vertex": return <VertexTemplate data={data} />;
    case "horizon": return <HorizonTemplate data={data} />;
    case "mono": return <MonoTemplate data={data} />;
    case "impact": return <ImpactTemplate data={data} />;
    case "aurora":
    default: return <AuroraTemplate data={data} />;
  }
}

export default memo(ResumePreview);
