"use client";

import { CustomToastProvider } from "@/components/ui/toast";
import { DatastoreProvider } from "@/contexts/DatastoreContext";
import { WelcomeModal } from "@/components/WelcomeModal";
import { NotificationCenter } from "@/components/NotificationCenter";
import { StatusBar } from "@/components/StatusBar";
import { DatastoreManagerScreen } from "@/components/DatastoreManagerScreen";

export default function Home() {
  return (
    <CustomToastProvider>
      <DatastoreProvider>
        <WelcomeModal />
        <NotificationCenter />
        <main className="min-h-screen bg-background">
          <div className="container mx-auto p-4">
            <DatastoreManagerScreen />
          </div>
        </main>
        <StatusBar />
      </DatastoreProvider>
    </CustomToastProvider>
  );
}
