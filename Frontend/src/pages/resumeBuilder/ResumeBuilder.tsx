import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { useResumeEditor, useResumesIndex } from "@/hooks/useResumes";
import { uid, type ResumeData } from "@/types/resume-builder";

import SectionCard, { Field, inputCls } from "@/features/resumeBuilder/SectionCard";
import ExperienceEditor from "@/features/resumeBuilder/ExperienceEditor";
import { EducationEditor, ProjectsEditor, SkillsEditor } from "@/features/resumeBuilder/SimpleEditors";
import { CertificationsEditor, LanguagesEditor } from "@/features/resumeBuilder/MoreEditors";
import ResumePreview from "@/features/resumeBuilder/ResumePreview";
import ResumeToolbar from "@/features/resumeBuilder/ResumeToolbar";
import ATSScorePanel from "@/features/resumeBuilder/ATSScorePanel";
import JobMatchPanel from "@/features/resumeBuilder/JobMatchPanel";
import AIImproveButton from "@/features/resumeBuilder/AIImproveButton";

export default function ResumeBuilder() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, createBlank } = useResumesIndex();

  // If no id, bounce to dashboard (or create first resume).
  useEffect(() => {
    if (id) return;
    if (items.length === 0) {
      const meta = createBlank("Untitled resume");
      navigate(`/resume-builder/${meta.id}`, { replace: true });
    } else {
      navigate(`/resumes`, { replace: true });
    }
  }, [id, items.length, createBlank, navigate]);

  const editor = useResumeEditor(id);
  const { data } = editor;
  const [jdKeywords, setJdKeywords] = useState<string[]>([]);

  // typed helpers for arrays
  const addExperience = () =>
    editor.addItem("experience", {
      id: uid(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      bullets: [""],
    });
  const addEducation = () =>
    editor.addItem("education", { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", notes: "" });
  const addProject = () => editor.addItem("projects", { id: uid(), name: "", url: "", description: "", tech: [] });
  const addSkillGroup = () => editor.addItem("skills", { id: uid(), category: "", items: [] });
  const addCert = () => editor.addItem("certifications", { id: uid(), name: "", issuer: "", date: "", url: "" });
  const addLang = () => editor.addItem("languages", { id: uid(), name: "", level: "" });

  if (!id) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1500px] space-y-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/resumes")}
              className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="h-3 w-3" /> My Resumes
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{data.meta?.name || "Resume Builder"}</h1>
              <p className="text-sm text-gray-500">Edit on the left, preview on the right. Changes save automatically.</p>
            </div>
          </div>
        </header>

        <ResumeToolbar
          data={data}
          onChangeTemplate={(t) => editor.patch("template", t)}
          onChangeAccent={(a) => editor.patch("accent", a)}
          onReset={() => editor.replaceAll({})}
          onImport={(d: ResumeData) => editor.replaceAll(d)}
          onUndo={editor.undo}
          onRedo={editor.redo}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          savedAt={editor.savedAt}
        />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px_minmax(0,1fr)]">
          {/* Editor */}
          <div className="space-y-4 print:hidden">
            <SectionCard title="Contact" description="Header of your resume">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name">
                  <input className={inputCls} value={data.contact.fullName} onChange={(e) => editor.updateContact("fullName", e.target.value)} />
                </Field>
                <Field label="Headline / Title">
                  <input className={inputCls} value={data.contact.title} onChange={(e) => editor.updateContact("title", e.target.value)} />
                </Field>
                <Field label="Email">
                  <input type="email" className={inputCls} value={data.contact.email} onChange={(e) => editor.updateContact("email", e.target.value)} />
                </Field>
                <Field label="Phone">
                  <input className={inputCls} value={data.contact.phone} onChange={(e) => editor.updateContact("phone", e.target.value)} />
                </Field>
                <Field label="Location">
                  <input className={inputCls} value={data.contact.location} onChange={(e) => editor.updateContact("location", e.target.value)} />
                </Field>
                <Field label="Website">
                  <input className={inputCls} value={data.contact.website} onChange={(e) => editor.updateContact("website", e.target.value)} />
                </Field>
                <Field label="LinkedIn">
                  <input className={inputCls} value={data.contact.linkedin} onChange={(e) => editor.updateContact("linkedin", e.target.value)} />
                </Field>
                <Field label="GitHub">
                  <input className={inputCls} value={data.contact.github} onChange={(e) => editor.updateContact("github", e.target.value)} />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Professional Summary"
              actions={
                <AIImproveButton
                  kind="summary"
                  text={data.summary}
                  context={data.contact.title}
                  onPick={(v) => editor.patch("summary", v)}
                />
              }
            >
              <textarea
                rows={4}
                className={inputCls + " resize-y"}
                value={data.summary}
                onChange={(e) => editor.patch("summary", e.target.value)}
                placeholder="A short pitch highlighting your strongest 3–4 selling points."
              />
            </SectionCard>

            <SectionCard title="Experience" onAdd={addExperience} addLabel="Add role">
              <ExperienceEditor
                items={data.experience}
                update={(id, p) => editor.updateItem("experience", id, p)}
                remove={(id) => editor.removeItem("experience", id)}
              />
            </SectionCard>

            <SectionCard title="Projects" onAdd={addProject} addLabel="Add project">
              <ProjectsEditor
                items={data.projects}
                update={(id, p) => editor.updateItem("projects", id, p)}
                remove={(id) => editor.removeItem("projects", id)}
              />
            </SectionCard>

            <SectionCard title="Education" onAdd={addEducation} addLabel="Add school">
              <EducationEditor
                items={data.education}
                update={(id, p) => editor.updateItem("education", id, p)}
                remove={(id) => editor.removeItem("education", id)}
              />
            </SectionCard>

            <SectionCard title="Skills" onAdd={addSkillGroup} addLabel="Add group">
              <SkillsEditor
                items={data.skills}
                update={(id, p) => editor.updateItem("skills", id, p)}
                remove={(id) => editor.removeItem("skills", id)}
              />
            </SectionCard>

            <SectionCard title="Certifications" onAdd={addCert} addLabel="Add certification">
              <CertificationsEditor
                items={data.certifications}
                update={(id, p) => editor.updateItem("certifications", id, p)}
                remove={(id) => editor.removeItem("certifications", id)}
                move={(id, dir) => editor.moveItem("certifications", id, dir)}
              />
            </SectionCard>

            <SectionCard title="Languages" onAdd={addLang} addLabel="Add language">
              <LanguagesEditor
                items={data.languages}
                update={(id, p) => editor.updateItem("languages", id, p)}
                remove={(id) => editor.removeItem("languages", id)}
                move={(id, dir) => editor.moveItem("languages", id, dir)}
              />
            </SectionCard>
          </div>

          {/* AI side panel */}
          <aside className="space-y-4 print:hidden xl:sticky xl:top-4 xl:self-start">
            <ATSScorePanel data={data} jdKeywords={jdKeywords} />
            <JobMatchPanel data={data} onKeywordsChange={setJdKeywords} />
          </aside>

          {/* Preview */}
          <div className="xl:sticky xl:top-4 xl:self-start">
            <div className="rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 p-4 dark:from-gray-900 dark:to-gray-950 print:bg-transparent print:p-0">
              <div className="overflow-auto print:overflow-visible">
                <div className="origin-top scale-[0.72] sm:scale-[0.8] xl:scale-[0.72] 2xl:scale-[0.82] print:scale-100">
                  <ResumePreview data={data} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          @page { size: Letter; margin: 0; }
          html, body { background: #fff !important; }
          body > * { visibility: hidden !important; }
          #resume-print-area, #resume-print-area * { visibility: visible !important; }
          #resume-print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 8.5in !important;
            min-height: 11in !important;
            box-shadow: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}
