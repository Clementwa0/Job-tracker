import { useEffect, useRef } from "react";
import gsap from "gsap";

interface TypingTextProps {
  text: string;
}

const TypingText = ({ text }: TypingTextProps) => {
  const typingRef = useRef<HTMLSpanElement | null>(null);
  const cursorRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    let i = 0;

    const interval = setInterval(() => {
      if (!typingRef.current) return;

      typingRef.current.textContent += text.charAt(i);

      i++;

      if (i >= text.length) {
        clearInterval(interval);
      }
    }, 80);

    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        repeat: -1,
        yoyo: true,
        duration: 0.6,
      });
    }

    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="block text-green-500 mt-2 text-2xl sm:text-3xl md:text-4xl">
      <span ref={typingRef}></span>

      <span ref={cursorRef} className="ml-1 inline-block">
        |
      </span>
    </span>
  );
};

export default TypingText;