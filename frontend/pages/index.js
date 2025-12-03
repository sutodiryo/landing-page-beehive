import Link from 'next/link';
import axios from 'axios';
import Navbar from '../components/Navbar';

export default function Home({ articles = [], projects = [] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Company Profile</h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8">
            Showcase of articles and projects built with modern tech
          </p>
          <Link href="#projects" className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-lg hover:bg-blue-50 transition">
            Explore Projects
          </Link>
        </div>
      </section>

      {/* Articles Section */}
      <section id="articles" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Latest Articles</h2>
          {articles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map(a => (
                <div key={a._id || a.id} className="block bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{a.title}</h3>
                    <p className="text-gray-600 text-sm">{a.author ? `by ${a.author}` : 'Anonymous'}</p>
                    <p className="text-gray-700 mt-4 line-clamp-3">{a.content || 'No content preview available'}</p>
                    <Link href={`/articles/${a.slug}`} className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
                      Read more →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No articles available yet.</p>
          )}
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Featured Projects</h2>
          {projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(p => (
                <div key={p._id || p.id} className="block bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border border-gray-200">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{p.description || 'No description available'}</p>
                    <Link href={`/projects/${p.slug}`} className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
                      {/* Learn more → */}
                      Visit Project ↗
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-center">No projects available yet.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p>&copy; 2025 Company Profile. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export async function getServerSideProps() {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  try {
    const [artRes, projRes] = await Promise.all([
      axios.get(`${backend}/api/articles`),
      axios.get(`${backend}/api/projects`),
    ]);
    return { props: { articles: artRes.data, projects: projRes.data } };
  } catch (err) {
    return { props: { articles: [], projects: [] } };
  }
}
