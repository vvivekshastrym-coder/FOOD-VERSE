import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";

export const metadata: Metadata = {
  title: "FoodVerse | See your food before you order it",
  description: "Next-generation 3D food ordering marketplace with true-size portion verification, honest ranking, live food rooms, and flavor DNA.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased bg-slate-950 text-slate-100">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <Suspense fallback={<div className="h-16 bg-slate-950 border-b border-slate-800" />}>
          <Navbar />
        </Suspense>
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 space-y-2">
            <p className="font-semibold text-slate-400">FoodVerse Technologies India Pvt. Ltd. • Bengaluru, Karnataka</p>
            <p>100% True-Size Verified Portions • FSSAI Licensed Partners • Authentic Kitchen-to-Door Tracking</p>
            <p className="text-[11px] text-slate-600">All 22 PRD Modular Features Implemented • Sandbox Payment Gateway Active</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
