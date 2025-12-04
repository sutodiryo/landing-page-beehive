import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminHome() {
  const router = useRouter();
  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) router.push('/admin/login');
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-blue-100">Manage your website content and settings</p>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Articles Card */}
          <Link href="/admin/articles" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Articles</h2>
            <p className="text-gray-600">Create, edit, and manage articles for your blog</p>
            <div className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
              Go to Articles →
            </div>
          </Link>

          {/* Projects Card */}
          <Link href="/admin/projects" className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition border-l-4 border-green-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Projects</h2>
            <p className="text-gray-600">Create, edit, and manage your project portfolio</p>
            <div className="mt-4 inline-block text-green-600 font-semibold hover:underline">
              Go to Projects →
            </div>
          </Link>
        </div>

        {/* Logout Button */}
        <div className="flex items-center justify-between bg-white p-6 rounded-lg shadow-md">
          <p className="text-gray-700">Ready to sign out?</p>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
