"use client";

import { useState, useEffect } from "react";
import { NavHeader } from "@/components/nav-header";
import { Footer } from "@/components/footer";
import { CollectionRequestForm } from "@/components/collection-request-form";
import { FreighterConnectButton } from "@/components/freighter-connect-button";
import { useFreighter } from "@/components/freighter-provider";
import { Button } from "@/components/ui/button";
import { Sparkles, Wallet, CheckCircle, Loader2 } from "lucide-react";

export default function FactoryPage() {
  const [mounted, setMounted] = useState(false);
  const [intent, setIntent] = useState("");
  const [isReserving, setIsReserving] = useState(false);
  const [reserved, setReserved] = useState(false);
  const { isConnected, publicKey } = useFreighter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleReserve = async () => {
    setIsReserving(true);
    setReserved(false);

    setTimeout(() => {
      setIsReserving(false);
      setReserved(true);
    }, 900);
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-[#FFCC66] via-[#FF9999] to-[#1159CC]">
      <NavHeader showConnectButton />

      <section className="pt-28 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1159CC] mb-6">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Shimeji Factory
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Open an intergalactic portal, set an intention, and welcome a
              companion that grows with you.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-2">Intergalactic Portal</h2>
            <p className="text-gray-700 text-sm">
              Each portal opens to a unique shimeji. Add an intention so your
              new companion knows how to support you from day one.
            </p>
          </div>

          {!mounted ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FF9999] border-t-transparent mb-4"></div>
              <p className="text-gray-700">Loading...</p>
            </div>
          ) : isConnected ? (
            <div className="grid lg:grid-cols-[2fr,1fr] gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FFCC66] via-[#FF9999] to-[#FF99CC] flex items-center justify-center text-black font-bold">
                    Portal
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-1">Starter Portal</h3>
                    <p className="text-sm text-gray-700 mb-4">
                      Opens in a few days after purchase. We&apos;ll email you when
                      your shimeji is ready.
                    </p>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Intention for this portal
                    </label>
                    <textarea
                      value={intent}
                      onChange={(event) => setIntent(event.target.value)}
                      placeholder="e.g. Help me focus while I code, remind me to take breaks"
                      className="w-full min-h-[110px] rounded-xl border border-white/50 bg-white/80 p-3 text-sm text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#1159CC]"
                      maxLength={240}
                    />
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600">
                      <span>Max 240 characters</span>
                      <span>{intent.length}/240</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold mb-2">Checkout</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Connected as {publicKey ? `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}` : "Freighter"}.
                  </p>
                  <div className="flex items-center justify-between py-2 border-b border-white/30 text-sm">
                    <span>Portal price</span>
                    <span className="font-semibold">Coming soon</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-sm">
                    <span>Network</span>
                    <span className="font-semibold">Stellar</span>
                  </div>
                </div>

                {reserved ? (
                  <div className="mt-6 bg-white/80 rounded-2xl p-4 text-center">
                    <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-900">
                      Portal reserved!
                    </p>
                    <p className="text-xs text-gray-600">
                      We&apos;ll reach out when payments go live.
                    </p>
                  </div>
                ) : (
                  <Button
                    onClick={handleReserve}
                    disabled={isReserving}
                    className="mt-6 bg-[#1159CC] hover:bg-[#000000] text-white rounded-xl py-6"
                  >
                    {isReserving ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Reserving...
                      </span>
                    ) : (
                      "Reserve Portal"
                    )}
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 mb-8 bg-white/10 backdrop-blur-lg rounded-2xl">
              <Wallet className="w-12 h-12 text-gray-500 mb-4" />
              <p className="text-gray-700 text-center mb-4 max-w-sm">
                Connect your Freighter wallet to reserve a portal.
              </p>
              <FreighterConnectButton />
            </div>
          )}

          <CollectionRequestForm />
        </div>
      </section>

      <Footer />
    </main>
  );
}
