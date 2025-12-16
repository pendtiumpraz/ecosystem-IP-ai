"use client";

import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { UNSPLASH_IMAGES, CONTACT_INFO } from "@/lib/constants";
import { Clapperboard, Eye, EyeOff, Sparkles, Check, MessageCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = searchParams.get("tab") === "register" ? "register" : "login";
  
  const { user, login, register, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      if (user.role === "superadmin") router.push("/admin");
      else if (user.role === "investor") router.push("/investor");
      else router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    const result = await login(loginData.email, loginData.password);
    
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    } else {
      setError(result.error || "Login gagal");
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (registerData.password !== registerData.confirmPassword) {
      setError("Password tidak cocok!");
      return;
    }
    
    if (registerData.password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }
    
    setIsLoading(true);
    
    const result = await register({
      name: registerData.name,
      email: registerData.email,
      password: registerData.password,
    });
    
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.error || "Registrasi gagal");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Back to Home */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-amber-600 flex items-center justify-center">
              <Clapperboard className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
              MODO
            </span>
          </Link>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Selamat Datang</CardTitle>
              <CardDescription>
                Login atau daftar untuk mulai membuat IP Bible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={defaultTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="register">Daftar</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Masukkan password"
                          value={loginData.password}
                          onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300" />
                        Ingat saya
                      </label>
                      <Link href="/forgot-password" className="text-sm text-orange-600 hover:underline">
                        Lupa password?
                      </Link>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}
                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? "Memproses..." : "Login"}
                    </Button>
                    
                    {/* Demo Credentials */}
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-sm">
                      <p className="font-medium text-gray-700 mb-2">Demo Login:</p>
                      <p className="text-gray-600">Superadmin: admin@modo.id / demo123</p>
                      <p className="text-gray-600">Creator: creator@modo.id / demo123</p>
                      <p className="text-gray-600">Investor: investor@modo.id / demo123</p>
                    </div>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="register">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-name">Nama Lengkap</Label>
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Nama lengkap"
                        value={registerData.name}
                        onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-email">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="nama@email.com"
                        value={registerData.email}
                        onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="register-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Minimal 8 karakter"
                          value={registerData.password}
                          onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                          minLength={8}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="register-confirm">Konfirmasi Password</Label>
                      <Input
                        id="register-confirm"
                        type="password"
                        placeholder="Ulangi password"
                        value={registerData.confirmPassword}
                        onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                        required
                      />
                    </div>

                    {/* Trial Info */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-orange-700 font-medium mb-2">
                        <Sparkles className="w-5 h-5" />
                        Free 14-Day Trial
                      </div>
                      <ul className="space-y-1 text-sm text-orange-600">
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          2x AI generation gratis
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          1 project untuk dicoba
                        </li>
                        <li className="flex items-center gap-2">
                          <Check className="w-4 h-4" />
                          Tidak perlu kartu kredit
                        </li>
                      </ul>
                    </div>

                    <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                      {isLoading ? "Memproses..." : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Mulai Free Trial
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      Dengan mendaftar, kamu setuju dengan{" "}
                      <Link href="/terms" className="text-orange-600 hover:underline">Ketentuan Layanan</Link>
                      {" "}dan{" "}
                      <Link href="/privacy" className="text-orange-600 hover:underline">Kebijakan Privasi</Link>
                    </p>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">atau</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <Button variant="outline" className="w-full" size="lg">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Lanjutkan dengan Google
                </Button>
              </div>

              {/* Upgrade Info */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center">
                <p className="text-sm text-gray-600 mb-2">
                  Butuh upgrade atau bantuan?
                </p>
                <a
                  href={CONTACT_INFO.whatsapp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-green-600 font-medium hover:underline"
                >
                  <MessageCircle className="w-4 h-4" />
                  Chat {CONTACT_INFO.whatsapp.name}
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src={UNSPLASH_IMAGES.auth.creative}
          alt="Creative Workspace"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 to-indigo-900/80" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center text-white max-w-lg">
            <h2 className="text-3xl font-bold mb-4">
              Create Your IP Bible with AI
            </h2>
            <p className="text-xl text-orange-200 mb-8">
              Generate characters, build worlds, write stories, and export production-ready documents in minutes.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {["GPT-5.2", "Gemini 3", "FLUX.2", "Runway Gen-4.5"].map((model) => (
                <span key={model} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur">
                  {model}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-orange-200" />
        <div className="h-4 w-32 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<AuthLoading />}>
      <AuthContent />
    </Suspense>
  );
}

