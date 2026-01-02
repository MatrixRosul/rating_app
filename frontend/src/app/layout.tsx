import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Рейтинг Більярду",
  description: "Рейтингова система для гравців у більярд",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body>
        <AuthProvider>
          <AppProvider>
            <Header />
            {children}
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
