import type { Metadata } from "next"
import {
  Allura,
  Cormorant_Garamond,
  DM_Sans,
  Noto_Sans_Bengali,
} from "next/font/google"

import { Providers } from "@/components/providers"

import "./globals.css"

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
})

const allura = Allura({
  variable: "--font-allura",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
})

const notoSansBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "RupChorcha | Beauty, Elegance & Confidence",
    template: "%s | RupChorcha",
  },
  description:
    "RupChorcha is a considered salon experience for hair, skin, makeup, nails, and spa care.",
  applicationName: "RupChorcha",
  keywords: [
    "RupChorcha",
    "beauty salon",
    "hair salon",
    "skincare",
    "makeup",
    "manicure",
    "spa",
  ],
  authors: [{ name: "RupChorcha" }],
  creator: "RupChorcha",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "RupChorcha",
    title: "RupChorcha | Beauty, Elegance & Confidence",
    description:
      "A considered salon experience for hair, skin, makeup, nails, and spa care.",
  },
  twitter: {
    card: "summary_large_image",
    title: "RupChorcha | Beauty, Elegance & Confidence",
    description:
      "A considered salon experience for hair, skin, makeup, nails, and spa care.",
  },
  icons: {
    icon: "/brand/rupchorcha-favicon.svg",
    apple: "/brand/rupchorcha-favicon.svg",
  },
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${allura.variable} ${notoSansBengali.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
