import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';
import type { NextPage } from 'next';
import Link from 'next/link';

// --- IMPORT KOMPONEN SHADCN ---
import { Button } from '@/components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// --------------------------------

const LoginPage: NextPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // <-- Tambahkan state loading
  const router = useRouter();

  // Ambil error dari URL (jika ada redirect dari proteksi halaman)
  const serverError = router.query.error as string;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true); // <-- Set loading

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false); // <-- Matikan loading

    if (result?.error) {
      setError(result.error);
    } else if (result?.ok) {
      // Redirect ke halaman utama setelah login sukses
      router.push('/');
    }
  };

  return (
    // Kita gunakan flex untuk menengahkan form
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Login ke Akun Anda</CardTitle>
          <CardDescription>Masuk untuk melanjutkan belanja.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {(error || serverError) && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error || serverError}</span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@anda.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading} // <-- Tambahkan disable
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading} // <-- Tambahkan disable
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Login'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 underline">
              Register di sini
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginPage;