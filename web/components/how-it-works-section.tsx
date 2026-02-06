"use client";

import { ImagePlus, Paintbrush, Sparkles } from "lucide-react";
import { ScrollAnimation } from "./scroll-animation";
import { useLanguage } from "./language-provider";

const steps = [
  {
    icon: ImagePlus,
    step: "01",
    title: "Open a Portal",
    description:
      "Visit the Factory and open a Shimeji portal to begin the arrival ritual.",
  },
  {
    icon: Paintbrush,
    step: "02",
    title: "Set an Intention",
    description:
      "Write a short intention so your companion knows how to support you.",
  },
  {
    icon: Sparkles,
    step: "03",
    title: "Welcome Your Companion",
    description:
      "When your sprite is ready, install the Chrome extension and watch it come to life on screen.",
  },
];

export function HowItWorksSection() {
  const { isSpanish } = useLanguage();
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section id="how-it-works" className="py-8 px-4 sm:px-6 lg:px-8">
      <ScrollAnimation variants={variants}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight text-balance">
              {isSpanish ? "Cómo Funciona" : "How It Works"}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.title}
                className="group relative bg-card rounded-3xl p-8 border border-[#FF9999] transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-8">
                  <div className="w-14 h-14 bg-[#FF6666] rounded-2xl flex items-center justify-center transition-colors">
                    <step.icon className="w-6 h-6" />
                  </div>
                  <span className="text-5xl font-bold text-border  transition-colors font-mono">
                    {step.step}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-foreground mb-3">
                  {isSpanish
                    ? step.step === "01"
                      ? "Abre un portal"
                      : step.step === "02"
                        ? "Define una intención"
                        : "Recibe tu compañero"
                    : step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {isSpanish
                    ? step.step === "01"
                      ? "Visita Factory y abre un portal Shimeji para iniciar la llegada."
                      : step.step === "02"
                        ? "Escribe una intención breve para que tu compañero sepa cómo ayudarte."
                        : "Cuando tu sprite esté listo, instala la extensión de Chrome y mira cómo cobra vida."
                    : step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollAnimation>
    </section>
  );
}
