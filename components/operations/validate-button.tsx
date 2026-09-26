"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ValidateButton({ validateUrl, label = "Validate" }: { validateUrl: string; label?: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleValidate() {
    setPending(true);
    setError("");
    const response = await fetch(validateUrl, { method: "POST" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error ?? "Unable to validate this document.");
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button onClick={handleValidate} disabled={pending}>
        {pending ? "Validating..." : label}
      </Button>
      {error ? <p className="max-w-xs text-right text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
