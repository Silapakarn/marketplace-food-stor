import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from "@/modules/cart/context/CartContext";
import { Providers } from './providers';
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Food Store - Order Your Favorite Sets',
  description: 'Order delicious food sets with special discounts',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <CartProvider>
            {children}
          </CartProvider>
        </Providers>
      </body>
    </html>
  );
}
