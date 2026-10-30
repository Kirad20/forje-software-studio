export const Logo = ({ size = 28 }: { size?: number }) => (
  <span className="logo" style={{ width: size, height: size }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" aria-hidden>
      <path d="M4 18 12 4l8 14z" fill="#818cf8" />
      <path d="M8.5 18 12 11.5 15.5 18z" fill="#c7d2fe" />
    </svg>
  </span>
);

const icon = (d: string) => () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d={d} />
  </svg>
);

export const Back = icon("M15 18l-6-6 6-6");
export const Refresh = icon("M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5");
export const External = icon("M14 3h7v7M10 14 21 3M21 14v7H3V3h7");
export const Send = icon("M22 2 11 13M22 2l-7 20-4-9-9-4z");
export const Check = icon("M20 6 9 17l-5-5");
export const Cross = icon("M18 6 6 18M6 6l12 12");
export const Globe = icon("M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20");
