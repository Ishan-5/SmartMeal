"use client";

import { ArrowRight, ImagePlus, LoaderCircle, Plus, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { SAMPLE_PHOTO } from "@/lib/demo-data";
import { parseIngredientList } from "@/lib/ingredients";
import type { Ingredient } from "@/lib/types";
import type { AiMode } from "@/lib/ai";
import { cn } from "@/lib/utils";

interface Props {
  ingredients: Ingredient[];
  setIngredients: (items: Ingredient[]) => void;
  preview: string | null;
  setPreview: (value: string | null) => void;
  mode: AiMode | null;
  setMode: (mode: AiMode | null) => void;
  note: string;
  setNote: (note: string) => void;
  onNext: () => void;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("Could not open that image."));
      image.onload = () => {
        const max = 1200;
        const scale = Math.min(1, max / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("Your browser could not process that image."));
          return;
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      image.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ScanStep({ ingredients, setIngredients, preview, setPreview, mode, setMode, note, setNote, onNext }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragging, setDragging] = useState(false);
  const [newName, setNewName] = useState("");
  const [newQuantity, setNewQuantity] = useState("1");
  const [newUnit, setNewUnit] = useState("pcs");
  const [bulk, setBulk] = useState("");

  async function analyse(image: string) {
    setLoading(true);
    setError("");
    setNote("");
    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, mimeType: "image/jpeg" }),
      });
      const data = (await response.json()) as {
        ingredients?: Ingredient[];
        mode?: AiMode;
        note?: string;
        error?: string;
      };
      if (!response.ok || !data.ingredients) throw new Error(data.error ?? "Could not read that photo.");
      setIngredients(data.ingredients);
      setMode(data.mode ?? "demo");
      setNote(data.note ?? "");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function confirmReplace(): boolean {
    return !ingredients.length || window.confirm("Replace your current ingredient list with this photo?");
  }

  async function handleFile(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("That photo is too large. Try one under 10 MB.");
      return;
    }
    if (!confirmReplace()) return;
    setError("");
    setLoading(true);
    try {
      const compressed = await compressImage(file);
      setPreview(compressed);
      await analyse(compressed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not use that image.");
      setLoading(false);
    }
  }

  const handleFileRef = useRef(handleFile);
  useEffect(() => {
    handleFileRef.current = handleFile;
  }, [handleFile]);

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const items = Array.from(event.clipboardData?.items ?? []);
      const file = items.find((item) => item.kind === "file" && item.type.startsWith("image/"))?.getAsFile();
      if (!file) return;
      event.preventDefault();
      void handleFileRef.current(file);
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  async function useSample() {
    if (!confirmReplace()) return;
    setLoading(true);
    setError("");
    try {
      // Rasterise the vector sample so real vision APIs receive a standard JPEG.
      const response = await fetch(SAMPLE_PHOTO);
      const svg = await response.text();
      const objectUrl = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
      const image = new Image();
      await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error("Could not load sample photo."));
        image.src = objectUrl;
      });
      const canvas = document.createElement("canvas");
      canvas.width = 900;
      canvas.height = 900;
      canvas.getContext("2d")?.drawImage(image, 0, 0, 900, 900);
      URL.revokeObjectURL(objectUrl);
      const jpeg = canvas.toDataURL("image/jpeg", 0.85);

      setPreview(SAMPLE_PHOTO);
      await analyse(jpeg);
    } catch {
      setError("Could not load the sample photo.");
      setLoading(false);
    }
  }

  function updateIngredient(index: number, patch: Partial<Ingredient>) {
    setIngredients(ingredients.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function addIngredient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const name = newName.trim();
    const quantity = Number(newQuantity);
    if (!name || !Number.isFinite(quantity) || quantity <= 0) return;
    setIngredients([...ingredients, { name, quantity, unit: newUnit, confidence: 1 }]);
    setNewName("");
    setNewQuantity("1");
  }

  function addBulk(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const items = parseIngredientList(bulk);
    if (!items.length) return;
    setIngredients([...ingredients, ...items]);
    setBulk("");
  }

  return (
    <div>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-clay">Step 01</p>
          <h2 className="mt-2 font-serif text-3xl text-ink">Snap your ingredients</h2>
          <p className="muted-text mt-2 text-sm">Photograph your fridge, pantry, or grocery haul. We&apos;ll turn it into a usable inventory.</p>
        </div>
        {mode && (
          <span className={cn("shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold", mode === "ai" ? "bg-mint text-moss" : "bg-sand text-moss")}>
            {mode === "ai" ? "AI recognition" : "Demo recognition"}
          </span>
        )}
      </div>

      <div
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          void handleFile(event.dataTransfer.files[0]);
        }}
        className={cn(
          "mt-8 overflow-hidden rounded-3xl border-2 border-dashed transition-colors",
          dragging ? "border-moss bg-mint/40" : "border-moss/20 bg-cream/60",
        )}
      >
        {preview ? (
          <div className="relative">
            <img src={preview} alt="Your ingredient photo" className="max-h-[300px] w-full object-cover" />
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-cream/80 backdrop-blur-sm">
                <LoaderCircle className="h-7 w-7 animate-spin text-moss" />
                <p className="text-sm font-semibold text-moss">Reading your ingredients…</p>
              </div>
            )}
            <div className="absolute bottom-3 right-3 flex gap-2">
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="rounded-full bg-paper/90 px-3 py-2 text-xs font-semibold text-muted shadow-card transition-colors hover:text-clay"
                aria-label="Remove photo"
              >
                Remove
              </button>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="rounded-full bg-paper px-4 py-2 text-xs font-semibold text-moss shadow-card"
              >
                Change photo
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center gap-3 px-6 py-14 text-center"
          >
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-mint text-moss"><ImagePlus className="h-6 w-6" /></span>
            <span className="font-serif text-xl text-ink">Drop a photo here, or click to upload</span>
            <span className="text-xs text-muted">JPG, PNG or WEBP · upload, drop or paste · processed in your browser</span>
          </button>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(event) => {
            void handleFile(event.target.files?.[0]);
            event.target.value = "";
          }}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void useSample()} disabled={loading} className="btn-outline !px-4 !py-2 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Use a sample fridge
        </button>
        {note && <p className="text-xs text-muted">{note}</p>}
        {error && <p className="text-xs font-medium text-clay" role="alert">{error}</p>}
      </div>

      <div className="mt-10 border-t border-moss/10 pt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="field-label">Recognized inventory</p>
            <p className="text-xs text-muted">Check the quantities and edit anything we got wrong.</p>
          </div>
          <span className="rounded-full bg-mint px-3 py-1 text-xs font-semibold text-moss">{ingredients.length} items</span>
        </div>

        {ingredients.length ? (
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            {ingredients.map((item, index) => (
              <div key={`${item.name}-${index}`} className="flex items-center gap-2 rounded-2xl border border-moss/10 bg-paper px-3 py-2">
                <span className="h-2 w-2 shrink-0 rounded-full bg-sage" />
                <input
                  aria-label="Ingredient name"
                  value={item.name}
                  onChange={(event) => updateIngredient(index, { name: event.target.value })}
                  className="min-w-0 flex-1 bg-transparent text-sm font-medium text-ink focus:outline-none"
                />
                <input
                  aria-label={`Quantity of ${item.name}`}
                  type="number"
                  min="0.1"
                  step="any"
                  value={item.quantity}
                  onChange={(event) => updateIngredient(index, { quantity: Number(event.target.value) })}
                  className="w-16 rounded-lg bg-cream px-2 py-1 text-right text-xs font-semibold text-moss focus:outline-none"
                />
                <input
                  aria-label={`Unit for ${item.name}`}
                  value={item.unit}
                  onChange={(event) => updateIngredient(index, { unit: event.target.value })}
                  className="w-12 rounded-lg bg-cream px-1 py-1 text-center text-xs text-moss focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-cream hover:text-clay"
                  aria-label={`Remove ${item.name}`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-2xl bg-mint/50 p-6 text-center text-sm text-moss">
            No ingredients yet. Scan a photo or add your first item below.
          </div>
        )}

        <form onSubmit={addIngredient} className="mt-4 flex flex-wrap gap-2">
            <input value={newName} onChange={(event) => setNewName(event.target.value)} placeholder="Add an ingredient…" className="input !w-auto flex-1 !py-2 text-sm" aria-label="Ingredient name" />
            <input type="number" min="0.1" step="any" value={newQuantity} onChange={(event) => setNewQuantity(event.target.value)} className="input !w-20 !py-2 text-sm" aria-label="Quantity" />
            <select value={newUnit} onChange={(event) => setNewUnit(event.target.value)} className="input !w-24 !py-2 text-sm" aria-label="Unit">
              {["pcs", "g", "ml", "tbsp"].map((unit) => <option key={unit} value={unit}>{unit}</option>)}
            </select>
            <button type="submit" className="btn-outline !px-4 !py-2 text-xs"><Plus className="h-4 w-4" /> Add</button>
          </form>

        <form onSubmit={addBulk} className="mt-3 rounded-2xl border border-moss/10 bg-cream/60 p-3">
          <label className="field-label !mb-1.5" htmlFor="bulk-ingredients">Or paste a list</label>
          <textarea
            id="bulk-ingredients"
            value={bulk}
            onChange={(event) => setBulk(event.target.value)}
            rows={2}
            placeholder="eggs, 500g chicken, spinach, 2 tbsp olive oil"
            className="input !py-2 text-sm"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-[11px] text-muted">Comma, semicolon or one per line.</p>
            <button type="submit" disabled={!bulk.trim()} className="btn-outline !px-4 !py-2 text-xs disabled:opacity-40">
              <Plus className="h-4 w-4" /> Add list
            </button>
          </div>
        </form>

        <div className="mt-8 flex justify-end">
          <button type="button" onClick={onNext} disabled={!ingredients.length} className="btn-primary disabled:cursor-not-allowed disabled:opacity-40">
            Continue to household <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
