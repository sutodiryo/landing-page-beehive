import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${backend}/api/auth/login`, { username, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      router.push('/admin');
    } catch (err) {
      setError(err?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Login</h2>

        {error && (
          <div className="mb-4 text-red-700 bg-red-50 p-3 rounded">{error}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-75' : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-600">
          <p>
            Forgot password?{' '}
            <Link href="/admin/request-reset" className="text-blue-600 hover:underline">Request a reset token</Link>
            {' '} (token will be emailed or displayed for development).
          </p>
          <p className="mt-2">
            Don't have an account?{' '}
            <Link href="/admin/register" className="text-blue-600 hover:underline">Register here</Link>.
          </p>
        </div>
      </div>
    </div>
  )
}
