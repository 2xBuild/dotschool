"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
  Pencil,
} from "lucide-react";

import {
  createModule,
  updateModule,
  deleteModule,
} from "@/server/admin/module-actions";
import type { AdminBatchModule } from "@/server/admin/module-queries";
import { RichTextEditor } from "@/components/editor/rich-text-editor";

const inputCls =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";
const labelCls = "block text-xs font-medium mb-1 text-muted-foreground";
const btnPrimary =
  "rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50";
const btnSecondary =
  "rounded-md border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent disabled:opacity-50";

function ModuleCard({
  module,
  batchId,
}: {
  module: AdminBatchModule;
  batchId: string;
}) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const descriptionRef = useRef(module.description ?? "");

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("description", descriptionRef.current);
    const result = await updateModule(module.id, fd);
    setSaving(false);
    if ("error" in result) {
      setError(result.error ?? "Failed");
    } else {
      setEditing(false);
      router.refresh();
    }
  }

  async function handleDelete() {
    if (
      !confirm(
        `Delete "${module.title}"? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    setError(null);
    const result = await deleteModule(module.id);
    if ("error" in result) {
      setError(result.error ?? "Failed to delete module");
      setDeleting(false);
    } else {
      router.refresh();
    }
  }

  return (
    <div className="rounded-lg border border-border">
      {error && !editing && (
        <div className="border-b border-border bg-destructive/10 px-4 py-2 text-xs text-destructive">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
        >
          {expanded ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronRight className="size-4" />
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              W{module.weekNumber}.{module.moduleNumber}
            </span>
            <h4 className="truncate text-sm font-semibold">{module.title}</h4>
          </div>
          {module.topics.length > 0 && (
            <div className="mt-0.5 flex flex-wrap gap-1">
              {module.topics.map((t) => (
                <span
                  key={t}
                  className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(!editing);
            setExpanded(true);
          }}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          title="Edit module"
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={handleDelete}
          className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          title="Delete module"
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {expanded && (
        <div className="border-t border-border px-4 py-3 space-y-3">
          {editing ? (
            <form
              onSubmit={handleUpdate}
              className="space-y-3 rounded-md border border-border bg-muted/30 p-3"
            >
              {error && <p className="text-xs text-destructive">{error}</p>}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelCls}>Title *</label>
                  <input
                    name="title"
                    required
                    defaultValue={module.title}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Week</label>
                  <input
                    name="weekNumber"
                    type="number"
                    min={1}
                    defaultValue={module.weekNumber}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Module #</label>
                  <input
                    name="moduleNumber"
                    type="number"
                    min={1}
                    defaultValue={module.moduleNumber}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>
                  Topics (comma-separated)
                </label>
                <input
                  name="topics"
                  defaultValue={module.topics.join(", ")}
                  placeholder="Variables, Functions, Closures"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Content</label>
                <RichTextEditor
                  content={module.description ?? ""}
                  onChange={(html) => {
                    descriptionRef.current = html;
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className={btnPrimary}>
                  {saving ? "Saving..." : "Update Module"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className={btnSecondary}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {module.description && (
                <div
                  className="rte-content text-sm text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: module.description }}
                />
              )}
              {!module.description && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  No content yet — click the edit button to add content
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function AddModuleForm({
  batchId,
  onDone,
}: {
  batchId: string;
  onDone: () => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const descriptionRef = useRef("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("description", descriptionRef.current);
    const result = await createModule(batchId, fd);
    setSaving(false);
    if ("error" in result) {
      setError(result.error ?? "Failed");
    } else {
      router.refresh();
      onDone();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-border bg-muted/30 p-4"
    >
      <h4 className="text-sm font-semibold">New Module</h4>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className={labelCls}>Title *</label>
          <input name="title" required className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>Week</label>
          <input
            name="weekNumber"
            type="number"
            min={1}
            defaultValue={1}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Module #</label>
          <input
            name="moduleNumber"
            type="number"
            min={1}
            defaultValue={1}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>Topics (comma-separated)</label>
        <input
          name="topics"
          placeholder="Variables, Functions, Closures"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Content</label>
        <RichTextEditor
          content=""
          onChange={(html) => {
            descriptionRef.current = html;
          }}
        />
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? "Creating..." : "Create Module"}
        </button>
        <button type="button" onClick={onDone} className={btnSecondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

type Props = {
  batchId: string;
  modules: AdminBatchModule[];
};

export function ModuleManager({ batchId, modules }: Props) {
  const [adding, setAdding] = useState(false);

  const weeks = new Map<number, AdminBatchModule[]>();
  for (const m of modules) {
    const existing = weeks.get(m.weekNumber) ?? [];
    existing.push(m);
    weeks.set(m.weekNumber, existing);
  }
  const sortedWeeks = Array.from(weeks.entries()).sort(
    ([a], [b]) => a - b,
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">
            Modules ({modules.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Organize curriculum into weekly modules with rich text content
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAdding(true)}
          className={btnPrimary}
        >
          <span className="flex items-center gap-1">
            <Plus className="size-3" />
            Add Module
          </span>
        </button>
      </div>

      {adding && (
        <AddModuleForm batchId={batchId} onDone={() => setAdding(false)} />
      )}

      {sortedWeeks.length === 0 && !adding && (
        <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-border py-12">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No modules yet
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Add your first module to start building the curriculum
            </p>
          </div>
        </div>
      )}

      {sortedWeeks.map(([weekNum, weekModules]) => (
        <div key={weekNum} className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Week {weekNum}
          </h4>
          {weekModules.map((m) => (
            <ModuleCard key={m.id} module={m} batchId={batchId} />
          ))}
        </div>
      ))}
    </div>
  );
}
