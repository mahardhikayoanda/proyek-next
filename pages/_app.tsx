import { SessionProvider } from 'next-auth/react';
import type { AppProps } from 'next/app';
import { CartProvider } from '../context/CartContext'; // Akan kita buat
import '../styles/globals.css';

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
