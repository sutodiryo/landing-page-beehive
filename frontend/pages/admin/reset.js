import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { passwordMeetsRules } from '../../utils/validators';

export default function Reset() {
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('');
  const [loading, setLoading] = useState(false);
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const router = useRouter();

  useEffect(() => {
    if (router && router.query && router.query.token) {
      setToken(Array.isArray(router.query.token) ? router.query.token[0] : router.query.token);
    }
  }, [router]);

  // use shared validator from `frontend/utils/validators.js`

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setType('');
    if (!token) return setMessage('Token is required');
    if (!passwordMeetsRules(newPassword)) return setMessage('Password does not meet requirements');
    if (newPassword !== confirmPassword) return setMessage('Passwords do not match');

    setLoading(true);
    try {
      const res = await axios.post(`${backend}/api/auth/reset`, { token, newPassword });
      setMessage(res.data.message || 'Password reset successfully');
      setType('success');
      setTimeout(() => router.push('/admin/login'), 1200);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error resetting password');
      setType('error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Reset Password</h2>

        {message && (
          <div className={`mb-4 p-3 rounded ${type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
            {message}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Token (from email or server logs)</label>
            <input
              value={token}
              onChange={e => setToken(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="paste your reset token"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Create a new password"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Repeat new password"
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
            disabled={loading || !token || !newPassword || !confirmPassword}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600">
          <p>Need a token? <Link href="/admin/request-reset" className="text-blue-600 hover:underline">Request one</Link>.</p>
        </div>
      </div>
    </div>
  )
}
