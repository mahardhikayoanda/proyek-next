import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '../context/CartContext';

// Komponen Navbar baru
const Navbar = () => {
  const { data: session, status } = useSession();
  const { totalItems } = useCart();

  const userRole = (session?.user as any)?.role;

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo / Brand */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-xl font-bold text-gray-800 hover:text-blue-600">
              AksesorisKu
            </Link>
          </div>

          {/* Menu Kanan */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Katalog
            </Link>
            <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              Keranjang
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Status Login */}
            {status === 'loading' ? (
              <span className="text-sm text-gray-500">Loading...</span>
            ) : session ? (
              <>
                {/* Tampilkan link berdasarkan role */}
                {userRole === 'admin' ? (
                  <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Admin
                  </Link>
                ) : (
                  <Link href="/customer/dashboard" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                    Akun Saya
                  </Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;