import axios from 'axios';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

export default function ProjectPage({ project }) {
  if (!project) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-24 px-4 text-center text-gray-600">Project not found</main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto py-12 px-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {project.image ? (
            <div className="w-full h-64 overflow-hidden">
              <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{project.title}</h1>
            <p className="text-gray-700 mb-4">{project.description}</p>

            {project.url && (
              <p className="mt-4">
                <a href={project.url} target="_blank" rel="noreferrer" className="inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">Visit Project ↗</a>
              </p>
            )}

            <div className="mt-6">
              <Link href="/" className="text-blue-600 hover:underline">← Back to home</Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const { slug } = ctx.params;
  try {
    const res = await axios.get(`${backend}/api/projects/${slug}`);
    return { props: { project: res.data } };
  } catch (err) {
    return { props: { project: null } };
  }
}
