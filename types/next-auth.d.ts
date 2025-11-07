import 'next-auth';
import 'next-auth/jwt';

// Deklarasikan tipe kustom untuk Next-Auth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'admin' | 'customer';
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'customer';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'customer';
  }
}