export default function LogoMark({ className }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src="/assets/img/arkeos_logo_mark_animated.svg" width={240} height={234} alt="" aria-hidden="true" decoding="async" draggable={false} />
  );
}
