"use client";
import "@/styles/section_header.css";
import type { SectionCopy } from "@/defaults";
import { useCopy } from "@/lib/use_copy";
import type { CinemaType } from "@/lib/types";
import Btn from "./Btn";
import { CinemaBg } from "./CinemaMedia";
import SectionH2 from "./SectionH2";

type Props = { copy: SectionCopy; id?: string; cta_id?: string };

const MEDIA_TYPES: CinemaType[] = ["image", "video", "html"];

export default function SectionHeader({ copy, id, cta_id }: Props) {
  const { section_media } = useCopy("shared");
  const media_type = MEDIA_TYPES.find((t) => t === section_media.type) ?? "image";
  return (
    <div className="sec-hdr" id={id}>
      {section_media.url && (
        <div className="sec-hdr__media" aria-hidden="true">
          <CinemaBg url={section_media.url} type={media_type} active />
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
