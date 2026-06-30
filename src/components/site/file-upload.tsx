import { useCallback, useEffect, useId, useRef, useState } from "react";
import { UploadCloud, FileText, ImageIcon, X, AlertCircle } from "lucide-react";

export type UploadedFile = {
  id: string;
  file: File;
  previewUrl?: string;
};

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const DOC_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export type UploadKind = "image" | "document";

type FileUploadProps = {
  /** "image" allows JPG/PNG/WebP. "document" allows images + PDF + DOC/DOCX. */
  kind?: UploadKind;
  multiple?: boolean;
  maxSizeMb?: number;
  files: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  hint?: string;
};

const ACCEPT: Record<UploadKind, string> = {
  image: "image/jpeg,image/png,image/webp",
  document: "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx",
};

function allowedTypes(kind: UploadKind) {
  return kind === "image" ? IMAGE_TYPES : [...IMAGE_TYPES, ...DOC_TYPES];
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  kind = "document",
  multiple = false,
  maxSizeMb = 10,
  files,
  onChange,
  hint,
}: FileUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Revoke object URLs on unmount to avoid memory leaks.
  useEffect(() => {
    return () => {
      files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const accepted = allowedTypes(kind);
  const accept = kind === "image" ? "images (JPG, PNG, WebP)" : "PDF, DOC, JPG, PNG";

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setError(null);
      const list = Array.from(incoming);
      const valid: UploadedFile[] = [];
      for (const file of list) {
        const okType =
          accepted.includes(file.type) ||
          /\.(docx?|pdf|jpe?g|png|webp)$/i.test(file.name);
        if (!okType) {
          setError(`"${file.name}" is not an allowed file type. Accepted: ${accept}.`);
          continue;
        }
        if (file.size > maxSizeMb * 1024 * 1024) {
          setError(`"${file.name}" is larger than ${maxSizeMb} MB.`);
          continue;
        }
        const isImage = file.type.startsWith("image/");
        valid.push({
          id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
          file,
          previewUrl: isImage ? URL.createObjectURL(file) : undefined,
        });
      }
      if (valid.length === 0) return;
      if (multiple) {
        onChange([...files, ...valid]);
      } else {
        // Single mode: replace and revoke any prior preview.
        files.forEach((f) => f.previewUrl && URL.revokeObjectURL(f.previewUrl));
        onChange([valid[0]]);
      }
    },
    [accepted, accept, files, maxSizeMb, multiple, onChange],
  );

  const removeFile = (id: string) => {
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(files.filter((f) => f.id !== id));
  };

  return (
    <div className="space-y-3">
      <label
        htmlFor={inputId}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-border bg-background hover:border-primary/50 hover:bg-secondary/40"
        }`}
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-primary/10 text-primary">
          <UploadCloud className="h-5 w-5" />
        </span>
        <span className="text-sm font-medium text-foreground">
          Drag &amp; drop or <span className="text-primary">browse</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {hint ?? `${accept} · up to ${maxSizeMb} MB${multiple ? " · multiple files" : ""}`}
        </span>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={ACCEPT[kind]}
          multiple={multiple}
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-2.5"
            >
              {f.previewUrl ? (
                <img
                  src={f.previewUrl}
                  alt={f.file.name}
                  className="h-12 w-12 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-secondary text-muted-foreground">
                  {f.file.type.startsWith("image/") ? (
                    <ImageIcon className="h-5 w-5" />
                  ) : (
                    <FileText className="h-5 w-5" />
                  )}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(f.file.size)}</p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                aria-label={`Remove ${f.file.name}`}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
