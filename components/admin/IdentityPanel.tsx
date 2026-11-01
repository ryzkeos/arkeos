"use client";
import { PanelHead } from "./shared";

const MOVED_ITEMS = [
  ["Studio name, tagline, email, response time, founded year", "General"],
  ["Hero headline and hero background word", "Home and General"],
  ["Call to action text", "General"],
  ["About story, numbers, values and team", "About"],
  ["Process steps", "Services"],
];

export default function IdentityPanel({ onOpenWebsiteInfo }: { onOpenWebsiteInfo: () => void }) {
  return (
    <div className="admin-panel" id="panel-identity" style={{ display: "block" }}>
      <PanelHead title="IDENTITY" sub="Studio details, story, team and process now live in Website Info." />
      <div className="settings-section">
        <p className="settings-section-title">Moved to Website Info</p>
        <ul aria-label="Moved settings">
          {MOVED_ITEMS.map(([what, where]) => (
            <li key={what}>{what}: Website Info, {where} tab</li>
          ))}
        </ul>
        <p className="panel-sub">Values saved here before still show on the site until you set them in Website Info.</p>
        <div className="admin-actions">
          <button type="button" className="admin-btn admin-btn--accent" onClick={onOpenWebsiteInfo} aria-label="Open Website Info">Open Website Info</button>
        </div>
      </div>
    </div>
  );
}
