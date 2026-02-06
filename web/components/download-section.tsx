"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { EmailSubscribeModal } from "@/components/email-subscribe-modal";
import { Download, Bell, Smartphone } from "lucide-react";

type Platform = "android" | "ios" | null;

export function DownloadSection() {
  const [notifyPlatform, setNotifyPlatform] = useState<Platform>(null);

  return (
    <section id="download" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#1159CC] mb-6">
            <Download className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-5xl font-bold mb-4">Download Shimeji.dev</h2>
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Get your desktop companions on any platform. Choose your preferred
            way to bring shimejis to life!
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Chrome Extension</h3>
            <div className="text-left mb-4">
              <p className="mb-2">Follow these steps to install:</p>
              <ol className="list-decimal list-inside">
                <li>Click the button below to download the extension.</li>
                <li>Unzip the downloaded file.</li>
                <li>
                  Open Chrome and navigate to <code>chrome://extensions</code>.
                </li>
                <li>Enable &quot;Developer mode&quot; in the top right corner.</li>
                <li>Click &quot;Load unpacked&quot; and select the unzipped folder.</li>
              </ol>
            </div>
            <Button asChild>
              <a href="/shimeji-chrome-extension.zip" download>
                Download Extension
              </a>
            </Button>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center flex flex-col">
            <h3 className="text-2xl font-bold mb-4">Android</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-green-100 mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-gray-700 mb-4">
                Android app coming soon! Get notified when it launches on the
                Google Play Store.
              </p>
            </div>
            <Button
              onClick={() => setNotifyPlatform("android")}
              className="bg-[#1159CC] hover:bg-[#000000]"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center flex flex-col">
            <h3 className="text-2xl font-bold mb-4">iOS</h3>
            <div className="flex-1 flex flex-col justify-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-100 mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-gray-700 mb-4">
                iOS app coming soon! Get notified when it launches on the Apple
                App Store.
              </p>
            </div>
            <Button
              onClick={() => setNotifyPlatform("ios")}
              className="bg-[#1159CC] hover:bg-[#000000]"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notify Me
            </Button>
          </div>
        </div>
      </div>

      <EmailSubscribeModal
        isOpen={notifyPlatform === "android"}
        onClose={() => setNotifyPlatform(null)}
        type="updates"
        title="Android App Coming Soon!"
        subtitle="We'll notify you when the Android app is available"
        buttonText="Notify Me"
        metadata={{ platform: "android" }}
      />

      <EmailSubscribeModal
        isOpen={notifyPlatform === "ios"}
        onClose={() => setNotifyPlatform(null)}
        type="updates"
        title="iOS App Coming Soon!"
        subtitle="We'll notify you when the iOS app is available"
        buttonText="Notify Me"
        metadata={{ platform: "ios" }}
      />
    </section>
  );
}
