import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "react-medium-image-zoom/dist/styles.css";
import "./globals.css";
import { AllProvider } from "@/contexts/all-provider";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Krillion AI",
  description:
    "Generate stunning AI-powered ads with Krillion - Transform your marketing with intelligent ad creation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased !font-inter`}
      >
        <AllProvider>{children}</AllProvider>
      </body>
      {/* <Script
        async
        src="https://cloud.umami.is/script.js"
        data-website-id="dc6b8527-f537-4de2-97c5-0b970dd08bc8"
      /> */}
    </html>
  );
}
