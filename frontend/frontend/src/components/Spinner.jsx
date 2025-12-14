import React from "react";

export default function Spinner({ size = 8, color = "red-600", borderColor = "border-t-transparent" }) {
  /**
   * Props:
   * size: number => Tailwind width/height scale (w-{size} h-{size})
   * color: string => Tailwind color for spinner border
   * borderColor: string => Tailwind class for top border transparency
   */

  return (
    <div
      className={`w-${size} h-${size} border-4 border-${color} ${borderColor} rounded-full animate-spin`}
    ></div>
  );
}
