import axios from 'axios';
import Link from 'next/link';
import Footer from '../../components/Footer';
import Navbar from '../../components/Navbar';

export default function ArticlePage({ article }) {
  if (!article) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto py-24 px-4 text-center text-gray-600">Article not found</main>
      <Footer />
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-3xl mx-auto py-12 px-4">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {article.image ? (
            <div className="w-full h-64 overflow-hidden">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
            </div>
          ) : null}

          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{article.title}</h1>
            <p className="text-sm text-gray-500 mb-4">{article.author ? `by ${article.author}` : 'Anonymous'}</p>

            <div className="prose max-w-none text-gray-700">
              {article.content ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <p>No content available.</p>
              )}
            </div>

            <div className="mt-8">
              <Link href="/" className="inline-block text-blue-600 hover:underline">← Back to home</Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  )
}

import getBackendUrl from '../../utils/getBackendUrl';

export async function getServerSideProps(ctx) {
  const backend = getBackendUrl();
  const { slug } = ctx.params;
  try {
    const res = await axios.get(`${backend}/api/articles/${slug}`);
    return { props: { article: res.data } };
  } catch (err) {
    return { props: { article: null } };
  }
}
