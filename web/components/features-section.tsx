"use client";

import { ArrowLeftRight, Sparkles, Image } from "lucide-react";
import { ScrollAnimation } from "./scroll-animation";
import { ProjectFeedbackBox } from "./project-feedback-box";
import { useLanguage } from "./language-provider";

const features = [
  {
    icon: Image,
    title: "Intention-Led Portals",
    description:
      "Give your shimeji a purpose before it arrives so it can support your daily flow.",
  },
  {
    icon: ArrowLeftRight,
    title: "Stellar Wallet Ready",
    description:
      "Connect with Freighter and keep everything lightweight on the Stellar network.",
  },
  {
    icon: Sparkles,
    title: "Handcrafted Sprites",
    description:
      "Each shimeji is hand-animated with care, so your companion feels alive.",
  },
];

export function FeaturesSection() {
  const { isSpanish } = useLanguage();
  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="features" className="py-8 px-4 sm:px-6 lg:px-8">
      <ScrollAnimation variants={variants}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              {isSpanish ? "¿Por qué encargar un Shimeji?" : "Why Commission a Shimeji?"}
            </h2>
            <p className="text-lg text-foreground mt-4 max-w-xl mx-auto">
              {isSpanish
                ? "Dale vida a un compañero que nace con intención y te acompaña cada día"
                : "Bring a companion to life with intention and daily support"}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group bg-card rounded-3xl p-8 border border-[#FF9999] transition-all ${
                  index === 0 ? "sm:col-span-2 lg:col-span-1" : ""
                }`}
              >
                <div className="w-12 h-12 bg-[#FF6666] rounded-2xl flex items-center justify-center mb-6 transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>

                <h3 className="text-lg font-bold text-foreground mb-2">
                  {isSpanish
                    ? feature.title === "Intention-Led Portals"
                      ? "Portales con intención"
                      : feature.title === "Stellar Wallet Ready"
                        ? "Listo para Stellar"
                        : "Sprites hechos a mano"
                    : feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {isSpanish
                    ? feature.title === "Intention-Led Portals"
                      ? "Define un propósito antes de que se abra para que tu compañero llegue con sentido."
                      : feature.title === "Stellar Wallet Ready"
                        ? "Conecta Freighter y mantén todo ligero en la red Stellar."
                        : "Cada shimeji se anima a mano para que se sienta vivo."
                    : feature.description}
                </p>
              </div>
            ))}
          </div>

          <ProjectFeedbackBox />
        </div>
      </ScrollAnimation>
    </section>
  );
}
