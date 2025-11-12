"use client";

import { TrendingUp, Users, Zap, Award } from "lucide-react";

const metrics = [
  {
    icon: TrendingUp,
    value: "10M+",
    label: "Thumbnails Generated",
    description: "Trusted by creators worldwide",
  },
  {
    icon: Users,
    value: "50K+",
    label: "Active Creators",
    description: "Growing community daily",
  },
  {
    icon: Zap,
    value: "60s",
    label: "Average Generation Time",
    description: "Lightning-fast AI processing",
  },
  {
    icon: Award,
    value: "4.9/5",
    label: "User Rating",
    description: "Based on 10K+ reviews",
  },
];

export function Metrics() {
  return (
    <section className="relative w-full py-16 sm:py-24 bg-gradient-to-b from-white via-gray-50 to-white overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-600 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h3 className="text-sm mb-4 font-medium text-muted-foreground">Trusted by creators</h3>
          <h2 className="text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-4 font-bold">
            Numbers That Speak
            <br />
            <span className="bg-gradient-to-r from-[#FF0000] to-[#FF6B6B] bg-clip-text text-transparent">
              For Themselves
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="relative group"
              >
                <div className="bg-card rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl border border-border transition-all duration-300 hover:-translate-y-1 h-full">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-red-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2">
                        {metric.value}
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-foreground mb-1">
                        {metric.label}
                      </div>
                      <div className="text-sm text-muted-foreground">{metric.description}</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

