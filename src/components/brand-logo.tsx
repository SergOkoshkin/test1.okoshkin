"use client";

import { MouseEvent as ReactMouseEvent, useEffect, useRef } from "react";
import gsap from "gsap";
import { Locale } from "@/lib/i18n";

type Props = {
  locale: Locale;
};

const captions: Record<Locale, string> = {
  ru: "окна • двери • солнцезащита",
  uk: "вікна • двері • сонцезахист",
};

export function BrandLogo({ locale }: Props) {
  const shellRef = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<HTMLSpanElement>(null);
  const leftLeafRef = useRef<HTMLSpanElement>(null);
  const rightLeafRef = useRef<HTMLSpanElement>(null);
  const idleTimeline = useRef<gsap.core.Timeline | null>(null);
  const shellRotateX = useRef<((value: number) => void) | null>(null);
  const shellRotateY = useRef<((value: number) => void) | null>(null);
  const shellScale = useRef<((value: number) => void) | null>(null);
  const leftRotate = useRef<((value: number) => void) | null>(null);
  const rightRotate = useRef<((value: number) => void) | null>(null);
  const leftShift = useRef<((value: number) => void) | null>(null);
  const rightShift = useRef<((value: number) => void) | null>(null);

  useEffect(() => {
    if (!shellRef.current || !frameRef.current || !leftLeafRef.current || !rightLeafRef.current) return;

    shellRotateX.current = gsap.quickTo(shellRef.current, "rotateX", {
      duration: 0.3,
      ease: "power3.out",
    });
    shellRotateY.current = gsap.quickTo(shellRef.current, "rotateY", {
      duration: 0.3,
      ease: "power3.out",
    });
    shellScale.current = gsap.quickTo(shellRef.current, "scale", {
      duration: 0.24,
      ease: "power3.out",
    });
    leftRotate.current = gsap.quickTo(leftLeafRef.current, "rotateY", {
      duration: 0.34,
      ease: "power3.out",
    });
    rightRotate.current = gsap.quickTo(rightLeafRef.current, "rotateY", {
      duration: 0.34,
      ease: "power3.out",
    });
    leftShift.current = gsap.quickTo(leftLeafRef.current, "x", {
      duration: 0.34,
      ease: "power3.out",
    });
    rightShift.current = gsap.quickTo(rightLeafRef.current, "x", {
      duration: 0.34,
      ease: "power3.out",
    });

    gsap.set(leftLeafRef.current, { rotateY: -18, x: -1 });
    gsap.set(rightLeafRef.current, { rotateY: 18, x: 1 });

    idleTimeline.current = gsap.timeline({
      repeat: -1,
      yoyo: true,
      defaults: { ease: "sine.inOut" },
    });
    idleTimeline.current
      .to(leftLeafRef.current, { rotateY: -48, x: -4, duration: 1.7 }, 0)
      .to(rightLeafRef.current, { rotateY: 48, x: 4, duration: 1.7 }, 0)
      .to(frameRef.current, { boxShadow: "0 18px 34px rgba(18, 41, 29, 0.18)", duration: 1.7 }, 0)
      .to(shellRef.current, { scale: 1.04, duration: 1.7 }, 0);

    return () => {
      idleTimeline.current?.kill();
      idleTimeline.current = null;
    };
  }, []);

  function handlePointerEnter() {
    idleTimeline.current?.pause();
    shellScale.current?.(1.06);
    leftRotate.current?.(-62);
    rightRotate.current?.(62);
    leftShift.current?.(-5);
    rightShift.current?.(5);
  }

  function handlePointerMove(event: ReactMouseEvent<HTMLSpanElement>) {
    if (!shellRef.current) return;

    const bounds = shellRef.current.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width;
    const y = (event.clientY - bounds.top) / bounds.height;

    shellRotateX.current?.((0.5 - y) * 11);
    shellRotateY.current?.((x - 0.5) * 16);
    shellScale.current?.(1.08);
    leftRotate.current?.(-28 - x * 58);
    rightRotate.current?.(28 + (1 - x) * 58);
    leftShift.current?.(-2 - x * 5);
    rightShift.current?.(2 + (1 - x) * 5);
  }

  function handlePointerLeave() {
    shellRotateX.current?.(0);
    shellRotateY.current?.(0);
    shellScale.current?.(1);
    idleTimeline.current?.resume();
  }

  return (
    <span
      className="group inline-flex items-center gap-3.5"
      onMouseEnter={handlePointerEnter}
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <span
        ref={shellRef}
        className="relative grid h-[60px] w-[60px] place-items-center [perspective:1200px] [transform-style:preserve-3d]"
      >
        <span className="absolute inset-[4px] rounded-[18px] bg-[rgba(47,122,87,0.08)] blur-md" />

        <span
          ref={frameRef}
          className="absolute inset-0 rounded-[20px] border border-white/90 bg-[linear-gradient(145deg,#ffffff,#e0ece3)] shadow-[0_14px_28px_rgba(18,41,29,0.12)]"
        />

        <span className="absolute inset-[6px] rounded-[16px] border border-[#d7e4db] bg-[linear-gradient(180deg,#f7fbf8,#edf4ef)]" />
        <span className="absolute inset-y-[10px] left-1/2 z-[1] w-[2px] -translate-x-1/2 rounded-full bg-[#87a392]" />
        <span className="absolute left-[10px] right-[10px] top-1/2 z-[1] h-[2px] -translate-y-1/2 rounded-full bg-[#c6d8cc]" />

        <span
          ref={leftLeafRef}
          className="absolute left-[10px] top-[10px] bottom-[10px] z-[2] rounded-[10px] border border-white/92 bg-[linear-gradient(180deg,#ffffff,#dfece4)] shadow-[0_8px_18px_rgba(20,40,30,0.08)]"
          style={{
            width: "calc(50% - 11px)",
            transformOrigin: "left center",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="absolute inset-[3px] rounded-[8px] border border-[#c4d6ca] bg-[linear-gradient(180deg,#fafdfa,#edf5f0)]" />
          <span className="absolute right-[2px] top-[23%] h-[54%] w-[2px] rounded-full bg-[#6f8d7b]" />
          <span className="absolute right-[4px] top-1/2 h-[9px] w-[3px] -translate-y-1/2 rounded-full bg-[#6f8d7b]" />
        </span>

        <span
          ref={rightLeafRef}
          className="absolute right-[10px] top-[10px] bottom-[10px] z-[2] rounded-[10px] border border-white/92 bg-[linear-gradient(180deg,#ffffff,#dfece4)] shadow-[0_8px_18px_rgba(20,40,30,0.08)]"
          style={{
            width: "calc(50% - 11px)",
            transformOrigin: "right center",
            transformStyle: "preserve-3d",
          }}
        >
          <span className="absolute inset-[3px] rounded-[8px] border border-[#c4d6ca] bg-[linear-gradient(180deg,#fafdfa,#edf5f0)]" />
          <span className="absolute left-[2px] top-[23%] h-[54%] w-[2px] rounded-full bg-[#6f8d7b]" />
          <span className="absolute left-[4px] top-1/2 h-[9px] w-[3px] -translate-y-1/2 rounded-full bg-[#6f8d7b]" />
        </span>
      </span>

      <span className="flex min-w-0 flex-col">
        <span className="font-[var(--font-display)] text-[1.06rem] font-semibold uppercase tracking-[0.18em] text-[var(--text-main)]">
          Okoshkin
        </span>
        <span className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--text-muted)]">
          {captions[locale]}
        </span>
      </span>
    </span>
  );
}
