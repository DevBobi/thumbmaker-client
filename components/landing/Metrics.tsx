"use client";

import React from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

const stats = [
  { value: "17k+", label: "Thumbnails Generated" },
  { value: "400+", label: "Creators" },
  { value: "1,400+", label: "Proven Templates" },
  { value: "98%", label: "Faster than Photoshop" },
];

export function Metrics() {
  const demoVideoUrl = "https://youtu.be/KrLj6nc516A";
  const embedUrl = "https://www.youtube.com/embed/KrLj6nc516A?rel=0&modestbranding=1";

  return (
    <section
      id="metrics"
      className="bg-white px-4 py-16 sm:px-6 lg:py-20"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:gap-10">
        {/* Heading + Metrics */}
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.5fr)] lg:items-center">
          {/* Left: Copy */}
          <div className="space-y-4">
            <p className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-500">
              Proof it works
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
              We let the{" "}
              <span className="text-rose-500">numbers</span> do the talking
            </h2>
            <p className="max-w-md text-sm text-gray-600 sm:text-base">
              ThumbMaker is already powering channels across YouTube. From
              solo creators to growing teams, these are the outcomes they see
              after switching from manual thumbnail design.
            </p>
          </div>

          {/* Right: Stat cards */}
          <div className="grid w-full grid-cols-2 gap-4 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white via-white to-rose-50/40 p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/0 via-rose-500/[0.02] to-rose-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative">
                  <div className="text-2xl font-semibold text-gray-900 sm:text-3xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ContainerScroll
          titleComponent={
            <div className="space-y-4 text-center text-gray-900">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-rose-500">
                Scroll demo
              </p>
              <h3 className="text-4xl font-bold leading-tight sm:text-5xl md:text-[4.5rem]">
                <span className="text-rose-500">ThumbMaker</span> in Motion
              </h3>
            </div>
          }
        >
          <div className="relative overflow-hidden rounded-[28px] bg-black">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
            <iframe
              className="h-full w-full aspect-video rounded-[28px] border border-white/5"
              src={embedUrl}
              title="ThumbMaker demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-black/60 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              Live demo walkthrough
            </div>
            <Link
              href={demoVideoUrl}
              target="_blank"
              className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/90 backdrop-blur transition hover:bg-white/20"
            >
              <span>Watch on YouTube</span>
              <span aria-hidden>↗</span>
            </Link>
          </div>
        </ContainerScroll>
      </div>
    </section>
  );
}

const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 75%", "end 25%"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.9, 1] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [18, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [0, -120]);

  return (
    <div className="relative flex items-center justify-center p-2 md:p-6" ref={containerRef}>
      <div className="w-full pt-4 pb-2 md:pt-8 md:pb-4" style={{ perspective: "1000px" }}>
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} translate={translate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: React.ReactNode;
}) => {
  return (
    <motion.div style={{ translateY: translate }} className="mx-auto max-w-4xl text-center">
      {titleComponent}
    </motion.div>
  );
};

const Card = ({
  rotate,
  scale,
  translate,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        translateY: translate,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="mx-auto -mt-10 h-[30rem] w-full max-w-5xl rounded-[30px] border-4 border-[#6C6C6C] bg-[#222222] p-3 shadow-2xl md:h-[40rem] md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-2xl bg-gray-100 md:rounded-2xl md:p-4">
        {children}
      </div>
    </motion.div>
  );
};
