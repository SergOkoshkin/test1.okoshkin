"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

export function LandingAnimator() {
  const progressBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    const ctx = gsap.context(() => {
      // Scroll progress indicator
      if (progressBarRef.current) {
        gsap.to(progressBarRef.current, {
          scaleX: 1,
          ease: "none",
          scrollTrigger: {
            trigger: document.body,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.3,
          },
        });
      }

      // Reveal animations with improved easing
      const revealItems = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      revealItems.forEach((item) => {
        const delay = Number(item.dataset.delay ?? 0);
        const direction = item.dataset.revealDirection ?? "up";
        const fromVars: gsap.TweenVars = { opacity: 0, filter: "blur(10px)" };

        switch (direction) {
          case "left":
            fromVars.x = -40;
            break;
          case "right":
            fromVars.x = 40;
            break;
          case "down":
            fromVars.y = -34;
            break;
          default:
            fromVars.y = 34;
        }

        gsap.fromTo(item, fromVars, {
          y: 0,
          x: 0,
          opacity: 1,
          filter: "blur(0px)",
          duration: 1,
          delay,
          ease: "power4.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            once: true,
          },
        });
      });

      // Stagger animations for lists
      const staggerContainers = gsap.utils.toArray<HTMLElement>("[data-stagger]");
      staggerContainers.forEach((container) => {
        const children = container.children;
        gsap.fromTo(
          children,
          { y: 30, opacity: 0, scale: 0.95 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: {
              trigger: container,
              start: "top 85%",
              once: true,
            },
          },
        );
      });

      // Floating elements with varied timing
      const floatElements = gsap.utils.toArray<HTMLElement>("[data-float]");
      if (floatElements.length > 0) {
        floatElements.forEach((el, i) => {
          const distance = el.dataset.floatDistance ? Number(el.dataset.floatDistance) : 16;
          const duration = 3 + i * 0.4;
          gsap.to(el, {
            y: -distance,
            duration,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.3,
          });
        });
      }

      // Slow spin
      const spinElements = gsap.utils.toArray<HTMLElement>("[data-spin-slow]");
      if (spinElements.length > 0) {
        spinElements.forEach((el) => {
          gsap.to(el, {
            rotate: 360,
            duration: 22,
            repeat: -1,
            ease: "none",
          });
        });
      }

      // Pulse glow effect
      const pulseElements = gsap.utils.toArray<HTMLElement>("[data-pulse-glow]");
      if (pulseElements.length > 0) {
        pulseElements.forEach((el, i) => {
          gsap.to(el, {
            scale: 1.06,
            opacity: 0.8,
            duration: 2.2 + i * 0.3,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.5,
          });
        });
      }

      // Parallax effect on scroll
      const parallaxElements = gsap.utils.toArray<HTMLElement>("[data-parallax]");
      parallaxElements.forEach((el) => {
        const speed = Number(el.dataset.parallax ?? 0.3);
        gsap.to(el, {
          yPercent: -20 * speed,
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });

      // Counter animation for numbers
      const counterElements = gsap.utils.toArray<HTMLElement>("[data-counter]");
      counterElements.forEach((el) => {
        const target = Number(el.dataset.counter ?? 0);
        const duration = Number(el.dataset.counterDuration ?? 2);

        const counter = { value: 0 };
        gsap.to(counter, {
          value: target,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
          onUpdate: () => {
            el.textContent = Math.round(counter.value).toLocaleString();
          },
        });
      });

      // Text reveal with character animation
      const textRevealElements = gsap.utils.toArray<HTMLElement>("[data-text-reveal]");
      textRevealElements.forEach((el) => {
        const originalText = el.textContent ?? "";
        el.textContent = "";
        
        gsap.to(el, {
          text: {
            value: originalText,
            delimiter: "",
          },
          duration: 1.5,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true,
          },
        });
      });

      // Magnetic effect on buttons
      const magneticElements = gsap.utils.toArray<HTMLElement>("[data-magnetic]");
      magneticElements.forEach((el) => {
        const strength = Number(el.dataset.magnetic ?? 0.4);

        el.addEventListener("mousemove", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = el.getBoundingClientRect();
          const x = mouseEvent.clientX - rect.left - rect.width / 2;
          const y = mouseEvent.clientY - rect.top - rect.height / 2;

          gsap.to(el, {
            x: x * strength,
            y: y * strength,
            duration: 0.3,
            ease: "power2.out",
          });
        });

        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "elastic.out(1, 0.5)",
          });
        });
      });

      // Tilt effect on cards
      const tiltElements = gsap.utils.toArray<HTMLElement>("[data-tilt]");
      tiltElements.forEach((el) => {
        const maxTilt = Number(el.dataset.tilt ?? 8);

        el.addEventListener("mousemove", (e: Event) => {
          const mouseEvent = e as MouseEvent;
          const rect = el.getBoundingClientRect();
          const x = (mouseEvent.clientX - rect.left) / rect.width;
          const y = (mouseEvent.clientY - rect.top) / rect.height;

          gsap.to(el, {
            rotateX: (0.5 - y) * maxTilt,
            rotateY: (x - 0.5) * maxTilt,
            duration: 0.4,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        });

        el.addEventListener("mouseleave", () => {
          gsap.to(el, {
            rotateX: 0,
            rotateY: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.5)",
          });
        });
      });

      // Scale on scroll (zoom into sections)
      const scaleElements = gsap.utils.toArray<HTMLElement>("[data-scale-in]");
      scaleElements.forEach((el) => {
        gsap.fromTo(
          el,
          { scale: 0.92 },
          {
            scale: 1,
            ease: "none",
            scrollTrigger: {
              trigger: el,
              start: "top 90%",
              end: "top 40%",
              scrub: 1,
            },
          },
        );
      });

      // Line draw animation
      const lineElements = gsap.utils.toArray<HTMLElement>("[data-draw-line]");
      lineElements.forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0, transformOrigin: "left center" },
          {
            scaleX: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          },
        );
      });

      // Section fade transitions
      const sectionElements = gsap.utils.toArray<HTMLElement>("section");
      sectionElements.forEach((section, index) => {
        if (index === 0) return; // Skip first section
        
        gsap.fromTo(
          section,
          { opacity: 0.3 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: section,
              start: "top 95%",
              end: "top 70%",
              scrub: 1,
            },
          },
        );
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={progressBarRef}
      className="fixed left-0 top-0 z-50 h-[3px] w-full origin-left bg-[linear-gradient(90deg,var(--brand),var(--accent),var(--brand-strong))] scale-x-0"
      style={{ transformOrigin: "left center" }}
    />
  );
}
