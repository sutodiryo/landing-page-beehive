import { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function AdminArticles() {
  const [articles, setArticles] = useState([]);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { fetchArticles(); }, []);

  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchArticles = async () => { try { const res = await axios.get(`${backend}/api/articles`); setArticles(res.data); } catch (err) { setError('Failed to fetch articles'); } }
  const create = async () => {
    if (!title.trim() || !slug.trim()) { setError('Title and slug required'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${backend}/api/articles`, { title, slug, content, author }, { headers: { Authorization: 'Bearer ' + getToken() } });
      setTitle(''); setSlug(''); setContent(''); setAuthor('');
      setMessage('Article created'); setTimeout(() => setMessage(''), 3000);
      fetchArticles();
    } catch (err) { setError('Failed to create article'); } finally { setLoading(false); }
  }
  const remove = async (id) => {
    if (!confirm('Delete this article?')) return;
    try { await axios.delete(`${backend}/api/articles/${id}`, { headers: { Authorization: 'Bearer ' + getToken() } }); setMessage('Article deleted'); setTimeout(() => setMessage(''), 3000); fetchArticles(); } catch (err) { setError('Failed to delete article'); }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Admin Articles</h1>
      <Link href="/admin">← Back to Admin</Link>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
      <div style={{ border: '1px solid #ccc', padding: 10, marginBottom: 20 }}>
        <input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} /><br />
        <input placeholder="Slug" value={slug} onChange={e => setSlug(e.target.value)} /><br />
        <input placeholder="Author" value={author} onChange={e => setAuthor(e.target.value)} /><br />
        <textarea placeholder="Content" value={content} onChange={e => setContent(e.target.value)} rows={6} cols={60} /><br />
        <button onClick={create} disabled={loading}>{loading ? 'Creating...' : 'Create'}</button>
      </div>
      <h2>Existing Articles</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr><th>Title</th><th>Slug</th><th>Author</th><th>Action</th></tr></thead>
        <tbody>
        {articles.map(a => (
          <tr key={a.id}><td>{a.title}</td><td>{a.slug}</td><td>{a.author || '-'}</td><td><button onClick={() => remove(a.id)}>Delete</button></td></tr>
        ))}
        </tbody>
      </table>
    </div>
  )
}
