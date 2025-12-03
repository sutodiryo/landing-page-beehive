import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { passwordMeetsRules } from '../../utils/validators';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const router = useRouter();

  // Password validation is provided by frontend/utils/validators.js

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setType('');
    if (!username || !password) return setMessage('Username and password are required');
    if (!passwordMeetsRules(password)) return setMessage('Password does not meet requirements');
    if (password !== confirmPassword) return setMessage('Passwords do not match');

    setLoading(true);
    try {
      const res = await axios.post(`${backend}/api/auth/register`, { username, password });
      setMessage(res.data.message || 'User created');
      setType('success');
      setTimeout(() => router.push('/admin/login'), 1200);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error registering');
      setType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-lg w-full bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Create an admin account</h2>

        {message && (
          <div className={`mb-4 p-3 rounded ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a strong password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat your password"
              required
            />
          </div>

          <div className="text-sm text-gray-700">
            <strong>Password requirements:</strong>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>At least 12 characters</li>
              <li>One lowercase letter</li>
              <li>One uppercase letter</li>
              <li>One number</li>
              <li>One symbol (non-alphanumeric)</li>
            </ul>
          </div>

          <button
            type="submit"
            className={`w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-75' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>Already registered? <Link href="/admin/login" className="text-blue-600 hover:underline">Sign in</Link>.</p>
        </div>
      </div>
    </div>
  )
}
