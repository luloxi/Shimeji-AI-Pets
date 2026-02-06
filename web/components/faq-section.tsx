"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ScrollAnimation } from "./scroll-animation";
import { useLanguage } from "./language-provider";

const faqs = [
  {
    question: "What is a shimeji?",
    answer:
      "Shimeji are cute desktop mascots that originated in Japan. They're small animated characters that live on your screen, following your cursor and wandering around while you browse the web.",
  },
  {
    question: "Do I need a wallet to open a portal?",
    answer:
      "Yes. Connect a Stellar wallet (Freighter) to reserve a portal and handle payments when they open.",
  },
  {
    question: "How much does it cost?",
    answer:
      "Portal pricing will be shown in the Factory before you confirm. You'll only pay Stellar network fees at checkout.",
  },
  {
    question: "How long does it take?",
    answer:
      "Each shimeji is handcrafted, so turnaround time varies. We'll notify you when your sprite is ready. You can track the status in the Factory.",
  },
  {
    question: "What happens to my intention?",
    answer:
      "It guides the art direction and behavior prompts for your companion. You can refine it later if you want.",
  },
  {
    question: "Is the Chrome extension free?",
    answer:
      "Yes! The extension is free to download and includes a default mascot.",
  },
];

export function FAQSection() {
  const { isSpanish } = useLanguage();
  const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section id="faq" className="py-8 px-4 sm:px-6 lg:px-8">
      <ScrollAnimation variants={variants}>
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">
              {isSpanish ? "Preguntas Frecuentes" : "Frequently Asked Questions"}
            </h2>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-2xl px-6 data-[state=open]:shadow-sm"
              >
                <AccordionTrigger className="text-md text-left text-foreground hover:no-underline py-5 font-semibold">
                  {isSpanish
                    ? index === 0
                      ? "¿Qué es un shimeji?"
                      : index === 1
                        ? "¿Necesito una wallet para abrir un portal?"
                        : index === 2
                          ? "¿Cuánto cuesta?"
                          : index === 3
                            ? "¿Cuánto se demora?"
                            : index === 4
                              ? "¿Qué pasa con mi intención?"
                              : "¿La extensión de Chrome es gratis?"
                    : faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-md text-muted-foreground pb-5 leading-relaxed">
                  {isSpanish
                    ? index === 0
                      ? "Los shimeji son mascotas de escritorio que nacieron en Japón. Son personajes animados pequeños que viven en tu pantalla, siguen tu cursor y pasean mientras navegas."
                      : index === 1
                        ? "Sí. Conecta una wallet de Stellar (Freighter) para reservar un portal y pagar cuando se habiliten los cobros."
                      : index === 2
                          ? "El precio del portal aparecerá en Factory antes de confirmar. Solo pagarás comisiones de red de Stellar al finalizar."
                          : index === 3
                            ? "Cada shimeji se hace a mano, así que el tiempo puede variar. Te avisaremos cuando tu sprite esté listo. Puedes seguir el estado en Factory."
                            : index === 4
                              ? "Tu intención guía el estilo y comportamiento del compañero. Puedes ajustarla más adelante si lo deseas."
                              : "¡Sí! La extensión es gratuita e incluye una mascota por defecto."
                    : faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </ScrollAnimation>
    </section>
  );
}
