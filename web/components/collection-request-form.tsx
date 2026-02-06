"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailSubscribeModal } from "@/components/email-subscribe-modal";
import { Bell, Sparkles } from "lucide-react";

export function CollectionRequestForm() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1159CC] flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Custom Portal Lineages</h2>
          <p className="text-gray-700 text-sm mb-4">
            Soon you&apos;ll be able to request custom portal lineages, traits, and
            behaviors. Subscribe to get notified when this feature launches!
          </p>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1159CC] hover:bg-[#000000] text-white rounded-xl px-6"
          >
            <Bell className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </div>
      </div>

      <EmailSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="collection_request"
        title="Coming Soon!"
        subtitle="We'll notify you when custom portal requests open"
        buttonText="Notify Me"
      />
    </div>
  );
}
