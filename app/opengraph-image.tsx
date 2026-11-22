import { ImageResponse } from "next/og";

export const alt = "Nachricht — IT Event Portal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Latin-only text: the bundled OG font has no Japanese glyphs.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#e8ebf0",
        }}
      >
        <div
          style={{
            fontSize: 148,
            fontWeight: 700,
            letterSpacing: -4,
            backgroundImage: "linear-gradient(90deg, #f022a3, #8b5cf6 35%, #5798f2)",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          Nachricht
        </div>
        <div style={{ fontSize: 48, color: "#5b6170", marginTop: 8 }}>IT Event Portal</div>
        <div
          style={{
            marginTop: 48,
            width: 360,
            height: 10,
            borderRadius: 9999,
            backgroundImage: "linear-gradient(90deg, #ff6000 1%, #f022a3 51%, #8b5cf6)",
          }}
        />
        <div style={{ fontSize: 32, color: "#5b6170", marginTop: 40 }}>
          Conferences · Meetups · AWS · Cloud · SRE · AI
        </div>
      </div>
    ),
    size,
  );
}
