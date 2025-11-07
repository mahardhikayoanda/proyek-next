import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext';
import '../styles/globals.css'; // <-- Path ini sekarang akan valid

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <CartProvider>
        <Component {...pageProps} />
      </CartProvider>
    </SessionProvider>
  );
}
export default MyApp;