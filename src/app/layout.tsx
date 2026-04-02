import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PetSpeak - Pet Language Translator",
  description: "Understand what your cat or dog is trying to tell you! AI-powered pet communication translator that decodes vocalizations, body language, and behaviors.",
  keywords: ["pet translator", "cat language", "dog language", "pet communication", "animal behavior", "AI pet"],
  authors: [{ name: "PetSpeak Team" }],
  icons: {
    icon: "/pet-logo.png",
  },
  openGraph: {
    title: "PetSpeak - Pet Language Translator",
    description: "Understand what your cat or dog is trying to tell you!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
