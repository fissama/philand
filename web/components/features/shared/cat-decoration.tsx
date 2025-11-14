"use client";

import { useTheme } from "@/lib/theme-provider";
import { useEffect, useState } from "react";

const catEmojis = ["🐱", "😺", "😸", "😻", "🐈", "🐈‍⬛"];

export function CatDecoration() {
  const { theme } = useTheme();
  const [cats, setCats] = useState<Array<{ id: number; emoji: string; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    if (theme === "colorful") {
      // Generate random cat positions
      const newCats = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        emoji: catEmojis[Math.floor(Math.random() * catEmojis.length)],
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3
      }));
      setCats(newCats);
    } else {
      setCats([]);
    }
  }, [theme]);

  if (theme !== "colorful" || cats.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {cats.map((cat) => (
        <div
          key={cat.id}
          className="absolute text-6xl opacity-10"
          style={{
            left: `${cat.x}%`,
            top: `${cat.y}%`,
            animation: `float 3s ease-in-out infinite`,
            animationDelay: `${cat.delay}s`
          }}
        >
          {cat.emoji}
        </div>
      ))}
    </div>
  );
}
