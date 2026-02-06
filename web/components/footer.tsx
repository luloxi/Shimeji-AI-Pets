"use client";

import Link from "next/link";
import { Twitter, MessageCircle, Github } from "lucide-react";
import Image from "next/image";
import { UpdatesSubscribePopup } from "./updates-subscribe-popup";
import { useLanguage } from "./language-provider";

export function Footer() {
  const { isSpanish } = useLanguage();
  return (
    <footer>
      {/* Footer Links */}
      <div className="border-t border-primary-foreground/10 bg-primary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-3 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Shimeji Logo"
                    width={36}
                    height={36}
                  />
                </div>
                <span className="text-lg font-bold text-primary-foreground">
                  Shimeji Factory
                </span>
              </div>
              <p className="text-primary-foreground/60 text-sm max-w-xs mb-6 leading-relaxed">
                {isSpanish
                  ? "Abre un portal intergaláctico y define una intención. Tu shimeji llegará listo para acompañarte en tu escritorio."
                  : "Open an intergalactic portal and set an intention. Your shimeji will arrive ready to accompany you on your desktop."}
              </p>
              <div className="flex gap-3">
                <Link
                  href="https://x.com/shimejidev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="Discord"
                >
                  <MessageCircle className="w-4 h-4" />
                </Link>
                <Link
                  href="#"
                  className="w-9 h-9 rounded-xl bg-primary-foreground/10 flex items-center justify-center hover:bg-primary-foreground/20 transition-colors"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm text-primary-foreground">
                {isSpanish ? "Mantente informado" : "Stay Updated"}
              </h3>
              <UpdatesSubscribePopup
                buttonClassName="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground text-sm"
                buttonVariant="ghost"
              />
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm text-primary-foreground">
                {isSpanish ? "Navegación" : "Navigate"}
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/"
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {isSpanish ? "Inicio" : "Home"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/factory"
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {isSpanish ? "Fábrica" : "Factory"}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://x.com/shimejidev"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    X / Twitter
                  </Link>
                </li>
                <li>
                  <Link
                    href="/download"
                    className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    {isSpanish ? "Descargar" : "Download"}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Credits */}
          <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center">
            <p className="text-sm text-primary-foreground/60">
              {isSpanish ? "Creado por " : "Created by "}
              <Link
                href="https://x.com/LuloxDev"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground hover:underline"
              >
                @LuloxDev
              </Link>{" "}
              &{" "}
              <Link
                href="https://x.com/Kathonejo"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground hover:underline"
              >
                @Kathonejo
              </Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
