import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ImmunoTrace",
  description: "Personal health memory for recurring illnesses",
};

import { SessionProvider } from "@/components/providers/SessionProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans flex flex-col min-h-screen">
      <body className="min-h-full flex flex-col">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
