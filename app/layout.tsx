import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "London — GTM Intelligence Control Plane",
  description:
    "London is an enterprise control plane for GTM intelligence agents. Register agents, route tasks, enforce policy, and turn live web data into account intelligence — powered by Bright Data.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[var(--color-canvas)] text-[var(--color-ink)] antialiased">
        <div className="flex">
          <Sidebar />
          <div className="flex min-h-screen min-w-0 flex-1 flex-col">
            <Header />
            <main className="flex-1">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
