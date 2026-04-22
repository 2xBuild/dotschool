import { ImageResponse } from "next/og";

export const alt = "dotschool — self-study that actually works";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const BLUE = "#3b82f6";
const BOTTOM_HEIGHT = Math.round(630 * 0.07); // 44px

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Logo + name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {/* Rounded-square dot mark */}
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "20%",
              background: "#111111",
              flexShrink: 0,
            }}
          />
          {/* Wordmark */}
          <span
            style={{
              fontSize: 80,
              fontWeight: 700,
              color: "#111111",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            dotschool
          </span>
        </div>

        {/* Description */}
        <span
          style={{
            fontSize: 32,
            color: "#555555",
            letterSpacing: "-0.5px",
          }}
        >
          self-study that actually works
        </span>

        {/* Blue bottom strip */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: BOTTOM_HEIGHT,
            background: BLUE,
          }}
        />
      </div>
    ),
    { ...size },
  );
}
