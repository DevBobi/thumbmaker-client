import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "react-medium-image-zoom/dist/styles.css";
import "./globals.css";
import { AllProvider } from "@/contexts/all-provider";

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
  title: "THUMBMAKER",
  description:
    "Generate stunning AI-powered YouTube thumbnails with THUMBMAKER - Transform your videos with intelligent thumbnail creation that gets clicks",
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
        suppressHydrationWarning
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
