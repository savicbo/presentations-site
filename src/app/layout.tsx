import type { Metadata } from "next";
import { primaryFont } from "../config/fonts";
import "./globals.css";
import "../styles/transitions.css";

export const metadata: Metadata = {
  title: "Presentations",
  description: "Interactive web-based presentations with live polling",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Bitcount+Single:wght@100..900&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${primaryFont.variable} font-primary antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
