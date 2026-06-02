import "./globals.css";

export const metadata = {
  title: "ARK AI | Soluciones de Construcción Inteligente",
  description: "Plataforma SaaS con IA para planeación y diseño de vivienda",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
