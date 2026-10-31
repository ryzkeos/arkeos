"use client";
import { useState } from "react";
import { PAGE_KEYS, type PageKey } from "@/defaults";
import { PanelHead, type PanelProps } from "./shared";
import CopyEditor from "./copy/CopyEditor";
import { PAGE_LABELS } from "./copy/copy_schema";

export default function WebsiteInfoPanel({ toast }: Pick<PanelProps, "toast">) {
  const [page, setPage] = useState<PageKey>(PAGE_KEYS[0]);
  return (
    <div className="admin-panel" id="panel-website-info" style={{ display: "block" }}>
      <PanelHead title="WEBSITE INFO" sub="Edit the text of every page. Empty fields use the default text." />
      <div className="admin-filters copy-pages" role="tablist" aria-label="Website pages">
        {PAGE_KEYS.map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={page === key}
            className={`filter-btn${page === key ? " active" : ""}`}
            onClick={() => setPage(key)}
          >
            {PAGE_LABELS[key]}
          </button>
        ))}
      </div>
      <CopyEditor key={page} page={page} toast={toast} />
    </div>
  );
}
