"use client";

import { useDict } from "@/i18n";
import { useShell } from "@/store/shell";

/** CryPaper — notes that hold (persisted via the shell store). */
export function NotesApp() {
  const d = useDict();
  const notes = useShell((s) => s.notes);
  const setNotes = useShell((s) => s.setNotes);

  return (
    <div className="flex h-full flex-col px-4 py-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
        {d.notesApp.hint}
      </p>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="…"
        aria-label={d.apps.notes}
        className="no-scrollbar min-h-0 w-full flex-1 resize-none bg-transparent text-[14px] leading-relaxed outline-none select-text placeholder:text-muted/60"
        spellCheck={false}
      />
      <p className="shrink-0 pt-2 text-right font-mono text-[10px] text-muted">
        {notes.length} {d.notesApp.chars}
      </p>
    </div>
  );
}
