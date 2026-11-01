"use client";
import { useState } from "react";
import { PAGE_KEYS, type PageKey } from "@/defaults";
import { PanelHead, type PanelProps } from "./shared";
import CopyEditor from "./copy/CopyEditor";
import { COPY_SCHEMA, PAGE_LABELS, type CopyItem } from "./copy/copy_schema";

const ITEMS = Object.fromEntries(
  PAGE_KEYS.map((page) => [page, COPY_SCHEMA[page].map((field): CopyItem => ({ page, field }))]),
) as Record<PageKey, CopyItem[]>;

export default function WebsiteInfoPanel({ toast }: Pick<PanelProps, "toast">) {
  const [page, setPage] = useState<PageKey>(PAGE_KEYS[0]);
  return (
    <div className="admin-panel" id="panel-website-info" style={{ display: "block" }}>
      <PanelHead title="WEBSITE INFO" sub="Edit the text of every page. Empty fields use the default text. Images, videos and links are in Site Settings." />
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
      <CopyEditor
        key={page}
        items={ITEMS[page]}
        toast={toast}
        title={PAGE_LABELS[page].toUpperCase()}
        sub="Leave a field empty to use its default text. Placeholders show the default."
        saved_label={`${PAGE_LABELS[page]} text`}
      />
    </div>
  );
}
