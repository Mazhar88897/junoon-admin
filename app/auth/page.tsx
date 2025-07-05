'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  // Carousel state for right side
  const carouselSlides = [
    {
      img: '/auth.png',
      title: 'Dashlite',
      desc: 'You can start to create your products easily with its user-friendly design & most completed responsive layout.'
    },
    {
      img: '/auth.png',
      title: 'Analytics',
      desc: 'Track your analytics and performance with real-time dashboards and beautiful charts.'
    },
    {
      img: '/auth.png',
      title: 'Secure Access',
      desc: 'Your data is protected with industry-leading security and privacy features.'
    }
  ];
  const [carouselIdx, setCarouselIdx] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setCarouselIdx((idx) => (idx + 1) % carouselSlides.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`https://junoon-vatb.onrender.com/api/auth/token-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      setError(data.error);
     
      if (!response.ok) {
        throw new Error(data.error);
        
      }

      // Store token in session with proper Authorization format
      const authToken = `Token ${data.token}`;
      sessionStorage.setItem('Authorization', authToken);
      
      // Log the token
      console.log('Auth Token:', authToken);

      // Redirect to test-server page
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f8f9fb]">
      {/* Left Side: Auth Form */}
      <div className="w-full max-w-md flex flex-col justify-between px-8 py-10 bg-white shadow-md min-h-screen">
        <div>
          <div className="flex items-center mb-8">
            <Image src="/Union.svg" alt="Logo" width={150} height={150} className="mr-2" />
                 </div>
          <h2 className="text-2xl font-bold mb-2">Sign-In</h2>
          <p className="text-sm font-semibold text-gray-400 mb-6">Access the DashLite panel using your email and passcode.</p>
          <form className="space-y-4 mt-6" onSubmit={handleSubmit}>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Email or Username</label>
                <a href="#" className="text-xs text-[#1A4D2E] hover:underline">Need Help?</a>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="block w-full px-3 text-sm py-2 border border-gray-200  focus:outline-none text-gray-900 bg-gray-50"
                placeholder="Enter your email address or username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Passcode</label>
                <a href="#" className="text-xs text-[#1A4D2E] hover:underline">Forgot Code?</a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="block w-full px-3 py-2 border border-gray-200  text-sm  text-gray-900 bg-gray-50 pr-10"
                  placeholder="Enter your passcode"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-3 flex items-center text-gray-400 cursor-pointer bg-transparent border-none p-0">
                  {showPassword ? (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.5" d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5"/></svg>
                  ) : (
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeWidth="1.5" d="M3 3l18 18M2 12s3.5-7 10-7c2.1 0 4 .5 5.6 1.3M22 12s-3.5 7-10 7c-2.1 0-4-.5-5.6-1.3"/><path stroke="currentColor" strokeWidth="1.5" d="M9.5 9.5a3 3 0 0 1 4.2 4.2"/></svg>
                  )}
                </button>
              </div>
            </div>
            {error && (
              <div className="text-red-500 text-xs text-center">{error}</div>
            )}
            <div className='mt-20'><button
              type="submit"
              className="w-full py-2 bg-[#1A4D2E] hover:bg-[#5a6edc] text-white rounded-md font-medium mt-2"
            >
              Sign in
            </button></div>
            
          </form>
          <div className="text-xs text-gray-500 mt-4 text-center">
            New on our platform? <a href="#" className="text-[#1A4D2E] hover:underline">Create an account</a>
          </div>
          <div className="flex items-center my-4">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-xs text-gray-400">OR</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
          <div className="flex justify-center gap-8 mb-2">
            <a href="#" className="text-[#1A4D2E] text-sm hover:underline">Facebook</a>
            <a href="#" className="text-[#1A4D2E] text-sm hover:underline">Google</a>
          </div>
          <div className="text-xs text-gray-500 text-center">
            I don&apos;t have an account? <a href="#" className="text-[#1A4D2E] hover:underline">Try 15 days free</a>
          </div>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center space-x-4">
          <a href="#" className="hover:underline">Terms & Condition</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Help</a>
          <span>English </span>
          <div className="mt-2">© 2024 DashLite. All Rights Reserved.</div>
        </div>
      </div>
      {/* Right Side: Illustration and Description */}
      <div className="flex-1 hidden w-full sm:block flex flex-col items-center justify-center px-8 py-10">
        <div className="flex flex-col items-center">
          <Image src={carouselSlides[carouselIdx].img} alt="Auth Illustration" width={420} height={260} className="mb-8 transition-all duration-500" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">{carouselSlides[carouselIdx].title}</h2>
          <p className="text-gray-500 text-center max-w-md">
            {carouselSlides[carouselIdx].desc}
          </p>
          <div className="flex gap-2 mt-6">
            {carouselSlides.map((_, idx) => (
              <span
                key={idx}
                className={`w-2 h-2 rounded-full ${idx === carouselIdx ? 'bg-[#1A4D2E]' : 'bg-gray-200'} inline-block`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
