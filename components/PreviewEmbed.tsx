// PULSE_PREVIEW_COMPONENT_START
import React, { useEffect, useRef } from "react";

type Props = { initialQuery?: string; height?: number | string; id?: string; };

const PreviewEmbed: React.FC<Props> = ({ initialQuery="Landing demo de Pulse", height=560, id="pulse-live-preview" }) => {
  const ref = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const fn = (q: string) => {
      if (!ref.current) return;
      const url = "/preview-embed?q=" + encodeURIComponent(q || initialQuery);
      ref.current.src = url;
    };
    (window as any).PULSE_UPDATE_PREVIEW = fn;
    fn(initialQuery);
    return () => {
      if ((window as any).PULSE_UPDATE_PREVIEW === fn) (window as any).PULSE_UPDATE_PREVIEW = undefined;
    };
  }, [initialQuery]);

  return (
    <iframe
      title="Preview en vivo"
      id={id}
      ref={ref}
      src="/preview-embed?q=loading"
      className="w-full rounded-2xl border"
      style={{ height: typeof height === "number" ? `${height}px` : height }}
    />
  );
};

export default PreviewEmbed;
// PULSE_PREVIEW_COMPONENT_END
