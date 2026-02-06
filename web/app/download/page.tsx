import { Footer } from "@/components/footer";
import { DownloadSection } from "@/components/download-section";
import { NavHeader } from "@/components/nav-header";

export default function DownloadPage() {
  return (
    <main className="min-h-screen">
      <NavHeader />
      <div className="bg-gradient-to-b from-[#FFCC66] via-[#FF9999]  to-[#1159CC] overflow-x-hidden ">
        <DownloadSection />
      </div>
      <Footer />
    </main>
  );
}
