"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailSubscribeModal } from "@/components/email-subscribe-modal";
import { Bell } from "lucide-react";

interface UpdatesSubscribePopupProps {
  buttonClassName?: string;
  buttonVariant?: "default" | "outline" | "ghost";
}

export function UpdatesSubscribePopup({
  buttonClassName = "",
  buttonVariant = "default",
}: UpdatesSubscribePopupProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={buttonVariant}
        className={buttonClassName}
      >
        <Bell className="w-4 h-4 mr-2" />
        Subscribe for Updates
      </Button>

      <EmailSubscribeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type="updates"
        title="Stay in the Loop"
        subtitle="Get notified about new features and shimejis"
        buttonText="Subscribe"
      />
    </>
  );
}
