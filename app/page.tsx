'use client'

import { useRouter } from 'next/navigation';
import { useState,useEffect } from 'react';
import { setCookie,hasCookie } from 'cookies-next';


interface Errors {
  username?: string;
  password?: string;
}

export default function Home() {
  const [userdata, setUserdata] = useState({
    username: 'anand',
    password: 'anand#123@',
  });
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({
    username: '',
    password: '',
  });
  const router = useRouter();

  useEffect(() => {
    const checkCookie = async () => {
        if (hasCookie('USERNAME')) {
            router.push('/dashboard')
        }
    };
    checkCookie();
}, [router]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: Errors = {};

    if (!username) {
      errors.username = 'Username is required';
    }

    if (!password) {
      errors.password = 'Password is required';
    }

    setErrors(errors);

    if (username != userdata.username) {
      errors.username = 'Invalid Username';
    }
    if (password != userdata.password) {
      errors.password = 'Invalid Password';
    }
    if (username === userdata.username && password === userdata.password) {
      setCookie('USERNAME', username, { path: '/', maxAge: 60 * 60 });
      router.push('/dashboard');
    }
  };



  return (
    
    <div className="min-h-screen flex justify-center items-center  bg-slate-100 p-4">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-3xl font-semibold text-center my-5">Login</h1>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-gray-700 text-sm font-bold mb-2">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:shadow-outline">Login</button>
        </form>
      </div>
    </div>
  );
}

