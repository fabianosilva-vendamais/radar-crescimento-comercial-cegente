import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Como está sua liderança hoje? | VendaMais • inFlux",
  description:
    "Autodiagnóstico de liderança nas dimensões O Líder, O Líder da Equipe e O Líder do Negócio. Evento inFlux com metodologia VendaMais.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          fontFamily: "'Archivo',system-ui,sans-serif",
          color: "#16181D",
          background: "#F4F2ED",
        }}
      >
        {children}
      </body>
    </html>
  );
}
