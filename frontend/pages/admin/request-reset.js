import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function RequestReset() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [message, setMessage] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    setToken('');
    setLoading(true);
    try {
      const res = await axios.post(`${backend}/api/auth/reset-request`, { username: usernameOrEmail, email: usernameOrEmail });
      setMessage(res.data.message || 'If user exists, an email will be sent.');
      if (res.data.token) setToken(res.data.token);
    } catch (err) {
      setMessage(err?.response?.data?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full bg-white shadow rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Request Password Reset</h2>

        {message && (
          <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700">{message}</div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username or email</label>
            <input
              value={usernameOrEmail}
              onChange={e => setUsernameOrEmail(e.target.value)}
              className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username or email"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-75' : ''}`}
            disabled={loading || !usernameOrEmail}
          >
            {loading ? 'Requesting...' : 'Request reset'}
          </button>
        </form>

        {token && (
          <div className="mt-6">
            <p className="font-semibold mb-2">Development token</p>
            <pre className="bg-gray-100 p-3 rounded break-words">{token}</pre>
            <div className="mt-3 flex items-center gap-3">
              <button
                onClick={() => { navigator.clipboard?.writeText(token); }}
                className="inline-flex items-center px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Copy token
              </button>
              <Link href={`/admin/reset?token=${token}`} className="text-blue-600 hover:underline">Open reset page with token</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
