// Login for testing use

"use client";
import React, { useState } from "react";
import api from "@/utils/api.class";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await api.login({ email, password });
      if (response.status) {
        const { accessToken, user } = response.data;

        document.cookie = `auth_token=${accessToken}; path=/`;
        localStorage.setItem("jwt_token", accessToken);
        localStorage.setItem("user_data", JSON.stringify(user));
        localStorage.setItem("user_id", user.id);
        localStorage.setItem("user_type", user.userType);

        // Redirect after successful login
        window.location.href = "/dashboard";
      } else {
        throw new Error("Login failed");
      }
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className='flex items-center justify-center h-screen bg-gray-100'>
      <form
        onSubmit={handleLogin}
        className='bg-white p-6 rounded shadow-md w-96'>
        <h2 className='text-2xl font-bold mb-4'>Login</h2>
        {error && <p className='text-red-600 mb-4'>{error}</p>}
        <div className='mb-4'>
          <label htmlFor='email' className='block text-sm font-medium'>
            Email
          </label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className='w-full p-2 border rounded'
            required
            aria-label='Email address'
          />
        </div>
        <div className='mb-4'>
          <label htmlFor='password' className='block text-sm font-medium'>
            Password
          </label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className='w-full p-2 border rounded'
            required
            aria-label='Password'
          />
        </div>
        <button
          type='submit'
          disabled={loading}
          className='w-full bg-primary text-white p-2 rounded hover:opacity-80 disabled:bg-gray-400'
          aria-label='Log in'>
          {loading ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default Login;
