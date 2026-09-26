import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import type { PortfolioProject } from "../../../drizzle/schema";
import { Check, FileUp, Loader2, Save, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DraftProject = {
  id: number;
  title: string;
  category: string;
  context: string;
  objective: string;
  audience: string;
  role: string;
  tools: string;
  aiContribution: string;
  editingDecisions: string;
  outcome: string;
  videoUrl: string;
  posterUrl: string;
  aspectRatio: string;
  duration: string;
  captionUrl: string;
  transcript: string;
  featured: boolean;
  displayOrder: number;
  workType: string;
};

type DraftField = Exclude<keyof DraftProject, "id" | "featured" | "displayOrder">;

const editableFields: Array<{ key: DraftField; label: string; multiline?: boolean; placeholder: string }> = [
  { key: "title", label: "Title", placeholder: "Project 01" },
  { key: "category", label: "Category / objective", placeholder: "Short, factual descriptor" },
  { key: "context", label: "Context", multiline: true, placeholder: "Client, training, or self-initiated context when verified" },
  { key: "objective", label: "Objective", multiline: true, placeholder: "What the work was intended to do" },
  { key: "audience", label: "Audience", placeholder: "Intended audience, if supplied" },
  { key: "role", label: "Maha's exact contribution", multiline: true, placeholder: "What Maha personally did" },
  { key: "editingDecisions", label: "Editing decisions", multiline: true, placeholder: "Pacing, captions, visual choices, or structure" },
  { key: "tools", label: "Tools", placeholder: "CapCut, Adobe Premiere Pro, or other verified tools" },
  { key: "aiContribution", label: "AI contribution", multiline: true, placeholder: "Specific AI-assisted step, if verified" },
  { key: "outcome", label: "Verified outcome", multiline: true, placeholder: "Leave empty when no outcome is supplied" },
  { key: "videoUrl", label: "Video URL", placeholder: "Cloudinary HTTPS delivery URL" },
  { key: "posterUrl", label: "Poster URL", placeholder: "Poster URL or use the upload control below" },
  { key: "aspectRatio", label: "Aspect ratio", placeholder: "9:16, 1:1, 16:9" },
  { key: "duration", label: "Duration", placeholder: "00:00" },
  { key: "captionUrl", label: "Caption URL", placeholder: "Optional VTT URL" },
  { key: "transcript", label: "Transcript", multiline: true, placeholder: "Optional transcript" },
  { key: "workType", label: "Work type", placeholder: "client, training, or self-initiated" },
];

function toDraft(project: PortfolioProject): DraftProject {
  return {
    id: project.id,
    title: project.title,
    category: project.category ?? "",
    context: project.context ?? "",
    objective: project.objective ?? "",
    audience: project.audience ?? "",
    role: project.role ?? "",
    tools: project.tools ?? "",
    aiContribution: project.aiContribution ?? "",
    editingDecisions: project.editingDecisions ?? "",
    outcome: project.outcome ?? "",
    videoUrl: project.videoUrl ?? "",
    posterUrl: project.posterUrl ?? "",
    aspectRatio: project.aspectRatio ?? "",
    duration: project.duration ?? "",
    captionUrl: project.captionUrl ?? "",
    transcript: project.transcript ?? "",
    featured: project.featured === 1,
    displayOrder: project.displayOrder,
    workType: project.workType ?? "",
  };
}

function UploadField({
  projectId,
  kind,
  label,
  accept,
  onComplete,
}: {
  projectId?: number | null;
  kind: "video" | "poster" | "caption" | "cv";
  label: string;
  accept: string;
  onComplete: () => void;
}) {
  const requestUpload = trpc.portfolio.requestUpload.useMutation();
  const completeUpload = trpc.portfolio.completeUpload.useMutation();
  const [status, setStatus] = useState("");

  const upload = async (file: File) => {
    setStatus("Preparing upload…");
    try {
      const presign = await requestUpload.mutateAsync({
        kind,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });
      setStatus("Uploading…");
      const response = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!response.ok) throw new Error(`Upload failed (${response.status})`);
      await completeUpload.mutateAsync({
        projectId: projectId ?? null,
        kind,
        originalName: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: file.size,
        storageKey: presign.key,
        storageUrl: presign.url,
      });
      setStatus("Uploaded and saved");
      onComplete();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    }
  };

  return (
    <label className="studio-upload-field">
      <input type="file" accept={accept} onChange={(event) => { const file = event.target.files?.[0]; if (file) void upload(file); event.currentTarget.value = ""; }} />
      <span className="studio-upload-icon">{requestUpload.isPending || completeUpload.isPending ? <Loader2 className="studio-spin" size={17} /> : <UploadCloud size={17} />}</span>
      <span><strong>{label}</strong><small>{status || "Choose a file"}</small></span>
    </label>
  );
}

export default function Studio() {
  const query = trpc.portfolio.adminData.useQuery();
  const updateProject = trpc.portfolio.updateProject.useMutation();
  const updateSettings = trpc.portfolio.updateSettings.useMutation();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, DraftProject>>({});
  const [cvUrl, setCvUrl] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!query.data) return;
    const nextDrafts = Object.fromEntries(query.data.projects.map((project) => [project.id, toDraft(project)]));
    setDrafts(nextDrafts);
    setSelectedId((current) => current ?? query.data.projects[0]?.id ?? null);
    setCvUrl(query.data.settings.cvUrl ?? "");
  }, [query.data]);

  const selectedProject = selectedId ? drafts[selectedId] : undefined;
  const filesByProject = useMemo(() => {
    const map = new Map<number, number>();
    for (const file of query.data?.files ?? []) if (file.projectId) map.set(file.projectId, (map.get(file.projectId) ?? 0) + 1);
    return map;
  }, [query.data?.files]);

  const updateDraft = (field: DraftField, value: string) => {
    if (!selectedId) return;
    setDrafts((current) => ({ ...current, [selectedId]: { ...current[selectedId], [field]: value } }));
  };

  const saveProject = async () => {
    if (!selectedProject) return;
    setNotice("Saving project…");
    await updateProject.mutateAsync(selectedProject);
    await query.refetch();
    setNotice("Project saved");
  };

  const saveSettings = async () => {
    setNotice("Saving settings…");
    await updateSettings.mutateAsync({ cvUrl: cvUrl.trim() || null });
    setNotice("Settings saved");
  };

  return (
    <DashboardLayout>
      <div className="studio-shell">
        <div className="studio-topbar">
          <div><span className="studio-eyebrow">MA / Private studio</span><h1>Portfolio content</h1><p>Persist project records, CV links, and media references without editing the public page.</p></div>
          {notice && <div className="studio-notice"><Check size={15} /> {notice}</div>}
        </div>
        <div className="studio-grid">
          <aside className="studio-sidebar">
            <div className="studio-side-heading"><span>Projects</span><small>{query.data?.projects.length ?? 0} records</small></div>
            {query.data?.projects.map((project, index) => {
              const draft = drafts[project.id];
              return <button key={project.id} type="button" className={`studio-project-tab ${selectedId === project.id ? "studio-project-tab-active" : ""}`} onClick={() => setSelectedId(project.id)}><span>0{index + 1}</span><strong>{draft?.title || project.title}</strong><small>{filesByProject.get(project.id) ?? 0} stored files</small></button>;
            })}
            <div className="studio-sidebar-rule" />
            <div className="studio-side-heading"><span>Storage</span><small>{query.data?.files.length ?? 0} files</small></div>
            <p className="studio-side-copy">Files upload directly to object storage. The database keeps the metadata and public storage reference only.</p>
          </aside>
          <section className="studio-editor">
            {query.isLoading && <div className="studio-empty"><Loader2 className="studio-spin" /> Loading saved records…</div>}
            {selectedProject && <>
              <div className="studio-editor-heading"><div><span className="studio-eyebrow">Editing record</span><h2>{selectedProject.title}</h2></div><button className="studio-save-button" type="button" onClick={() => void saveProject()} disabled={updateProject.isPending}><Save size={16} /> {updateProject.isPending ? "Saving" : "Save project"}</button></div>
              <div className="studio-meta-row"><label className="studio-check"><input type="checkbox" checked={selectedProject.featured} onChange={(event) => setDrafts((current) => ({ ...current, [selectedProject.id]: { ...selectedProject, featured: event.target.checked } }))} /><span>Featured project</span></label><span className="studio-db-badge"><span /> Stored in database</span></div>
              <div className="studio-form-grid">
                {editableFields.map((field) => <label className={`studio-field ${field.multiline ? "studio-field-wide" : ""}`} key={field.key}><span>{field.label}</span>{field.multiline ? <textarea value={selectedProject[field.key]} placeholder={field.placeholder} onChange={(event) => updateDraft(field.key, event.target.value)} rows={3} /> : <input value={selectedProject[field.key]} placeholder={field.placeholder} onChange={(event) => updateDraft(field.key, event.target.value)} />}</label>)}
              </div>
              <div className="studio-upload-section"><div className="studio-subheading"><div><span className="studio-eyebrow">File storage</span><h3>Attach media to this project</h3></div><p>Cloudinary URLs still work; uploaded files use built-in storage.</p></div><div className="studio-upload-grid"><UploadField projectId={selectedProject.id} kind="video" label="Upload video" accept="video/mp4,video/*" onComplete={() => void query.refetch()} /><UploadField projectId={selectedProject.id} kind="poster" label="Upload poster" accept="image/*" onComplete={() => void query.refetch()} /><UploadField projectId={selectedProject.id} kind="caption" label="Upload captions" accept=".vtt,text/vtt" onComplete={() => void query.refetch()} /></div></div>
            </>}
          </section>
        </div>
        <section className="studio-settings"><div><span className="studio-eyebrow">Site settings</span><h2>CV delivery link</h2><p>Leave empty to keep the public CV controls hidden. Set a stored file URL or approved public PDF URL when ready.</p></div><div className="studio-settings-form"><label className="studio-field"><span>CV URL</span><input value={cvUrl} placeholder="/manus-storage/… or public PDF URL" onChange={(event) => setCvUrl(event.target.value)} /></label><div className="studio-settings-actions"><button className="studio-save-button" type="button" onClick={() => void saveSettings()} disabled={updateSettings.isPending}><Save size={16} /> Save settings</button><UploadField kind="cv" label="Upload CV PDF" accept="application/pdf,.pdf" onComplete={() => void query.refetch()} /></div></div></section>
        <div className="studio-handoff"><FileUp size={16} /><span>Persistent data lives in MySQL/TiDB. Media bytes live in built-in object storage. No media bytes are stored in the database.</span></div>
      </div>
    </DashboardLayout>
  );
}
