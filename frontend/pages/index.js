import Link from 'next/link';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Home({ articles = [], projects = [] }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero Section (parallax) */}
      <section
        className="text-white py-28 px-4"
        style={{
          backgroundImage: `linear-gradient(rgba(30,64,175,0.55), rgba(29,78,216,0.55)), url('${process.env.NEXT_PUBLIC_HERO_IMAGE || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80'}')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
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
                  {a.image ? (
                    <img src={a.image} alt={a.title} className="w-full h-90 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100" />
                  )}
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
                  {p.image ? (
                    <img src={p.image} alt={p.title} className="w-full h-90 object-cover" />
                  ) : (
                    <div className="w-full h-40 bg-gray-100" />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{p.title}</h3>
                    <p className="text-gray-700 mb-4 line-clamp-2">{p.description || 'No description available'}</p>
                    <Link href={`/projects/${p.slug}`} className="mt-4 inline-block text-blue-600 font-semibold hover:underline">
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
      <Footer />
    </div>
  )
}

import getBackendUrl from '../utils/getBackendUrl';

export async function getServerSideProps() {
  // Resolve backend url at runtime (server vs client). Helper detects Docker runtime.
  const backend = getBackendUrl();
  try {
    const [artRes, projRes] = await Promise.all([
      axios.get(`${backend}/api/articles`),
      axios.get(`${backend}/api/projects`),
    ]);
    return { props: { articles: artRes.data, projects: projRes.data } };
  } catch (err) {
    console.error('getServerSideProps fetch error', err.message);
    return { props: { articles: [], projects: [] } };
  }
}
