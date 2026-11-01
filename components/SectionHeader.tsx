"use client";
import "@/styles/section_header.css";
import type { SectionCopy } from "@/defaults";
import { useCopy } from "@/lib/use_copy";
import Btn from "./Btn";
import { CinemaBg } from "./CinemaMedia";
import SectionH2 from "./SectionH2";

type Props = { copy: SectionCopy; id?: string; cta_id?: string };

export default function SectionHeader({ copy, id, cta_id }: Props) {
  const { section_media } = useCopy("shared");
  return (
    <div className="sec-hdr" id={id}>
      {section_media.url && (
        <div className="sec-hdr__media" aria-hidden="true">
          <CinemaBg url={section_media.url} active />
        </div>
      )}
      <div className="sec-main">
        {copy.label && <span className="section-lbl">{copy.label}</span>}
        {copy.lines.length > 0 && <SectionH2 lines={copy.lines} />}
      </div>
      {(copy.intro || copy.cta) && (
        <div className="sec-side">
          {copy.intro && <p className="sec-intro reveal">{copy.intro}</p>}
          {copy.cta && <Btn href={copy.cta.href} id={cta_id} label={copy.cta.label} />}
        </div>
      )}
    </div>
  );
}
