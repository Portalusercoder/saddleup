"use client";

import { useCallback, useEffect, useRef } from "react";

type SimpleRichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  minHeight?: string;
};

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export default function SimpleRichTextEditor({
  value,
  onChange,
  placeholder,
  ariaLabel,
  minHeight = "12rem",
}: SimpleRichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = editorRef.current;
    if (!el || el.innerHTML === value) return;
    el.innerHTML = value;
  }, [value]);

  const handleInput = useCallback(() => {
    const html = editorRef.current?.innerHTML ?? "";
    onChange(html);
  }, [onChange]);

  const btnClass =
    "px-2.5 py-1.5 border border-black/15 text-black/70 text-xs uppercase tracking-wider hover:bg-black/[0.04] dark:border-white/20 dark:text-white/70 dark:hover:bg-white/5";

  return (
    <div className="border border-black/20 dark:border-white/20">
      <div className="flex flex-wrap gap-1 p-2 border-b border-black/10 dark:border-white/10">
        <button type="button" className={btnClass} onClick={() => exec("bold")}>
          B
        </button>
        <button type="button" className={btnClass} onClick={() => exec("italic")}>
          I
        </button>
        <button type="button" className={btnClass} onClick={() => exec("insertUnorderedList")}>
          • List
        </button>
        <button
          type="button"
          className={btnClass}
          onClick={() => {
            const url = window.prompt("Link URL");
            if (url) exec("createLink", url);
          }}
        >
          Link
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-label={ariaLabel}
        aria-multiline
        data-placeholder={placeholder}
        onInput={handleInput}
        className="px-4 py-3 text-sm text-black outline-none min-h-[var(--editor-min-h)] empty:before:content-[attr(data-placeholder)] empty:before:text-black/40 dark:text-white dark:empty:before:text-white/40"
        style={{ "--editor-min-h": minHeight } as React.CSSProperties}
        suppressContentEditableWarning
      />
    </div>
  );
}
