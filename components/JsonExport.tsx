"use client";

import { Download } from "lucide-react";
import { Button } from "./ui/Button";

export function JsonExport({
  data,
  filename = "london-export.json",
  label = "Export JSON",
}: {
  data: unknown;
  filename?: string;
  label?: string;
}) {
  function handleExport() {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Button variant="secondary" onClick={handleExport}>
      <Download size={15} /> {label}
    </Button>
  );
}
