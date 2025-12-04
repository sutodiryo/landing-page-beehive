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
  const [messageType, setMessageType] = useState('');

  useEffect(() => { fetchArticles(); }, []);

  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const getToken = () => typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const fetchArticles = async () => { try { const res = await axios.get(`${backend}/api/articles`); setArticles(res.data); } catch (err) { setError('Failed to fetch articles'); } }
  const create = async () => {
    if (!title.trim() || !slug.trim()) { setError('Title and slug required'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      await axios.post(`${backend}/api/articles`, { title, slug, content, author }, { headers: { Authorization: 'Bearer ' + getToken() } });
      setTitle(''); setSlug(''); setContent(''); setAuthor('');
      setMessage('Article created successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
      fetchArticles();
    } catch (err) { 
      setError('Failed to create article');
      setMessageType('error');
    } finally { setLoading(false); }
  }
  const remove = async (id) => {
    if (!confirm('Delete this article?')) return;
    try { 
      await axios.delete(`${backend}/api/articles/${id}`, { headers: { Authorization: 'Bearer ' + getToken() } }); 
      setMessage('Article deleted successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000); 
      fetchArticles(); 
    } catch (err) { 
      setError('Failed to delete article');
      setMessageType('error');
    }
  }

  // Modal and image upload states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [createImageData, setCreateImageData] = useState('');
  const [createImagePreview, setCreateImagePreview] = useState('');
  const [editArticle, setEditArticle] = useState(null);
  const [editImageData, setEditImageData] = useState('');
  const [editImagePreview, setEditImagePreview] = useState('');

  // Resize image to 500x500 (cover) and return data URL
  const resizeImageTo500 = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          try {
            const targetSize = 500;
            const scale = Math.max(targetSize / img.width, targetSize / img.height);
            const cw = Math.round(img.width * scale);
            const ch = Math.round(img.height * scale);

            const canvas1 = document.createElement('canvas');
            canvas1.width = cw;
            canvas1.height = ch;
            const ctx1 = canvas1.getContext('2d');
            ctx1.drawImage(img, 0, 0, cw, ch);

            const canvas2 = document.createElement('canvas');
            canvas2.width = targetSize;
            canvas2.height = targetSize;
            const ctx2 = canvas2.getContext('2d');
            const sx = Math.max(0, Math.floor((cw - targetSize) / 2));
            const sy = Math.max(0, Math.floor((ch - targetSize) / 2));
            ctx2.drawImage(canvas1, sx, sy, targetSize, targetSize, 0, 0, targetSize, targetSize);

            const dataUrl = canvas2.toDataURL('image/jpeg', 0.85);
            resolve(dataUrl);
          } catch (err) {
            reject(err);
          }
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  const handleCreateImage = async (file) => {
    if (!file) return setCreateImageData('');
    const dataUrl = await resizeImageTo500(file);
    setCreateImageData(dataUrl);
    setCreateImagePreview(dataUrl);
  }

  const handleEditImage = async (file) => {
    if (!file) return setEditImageData('');
    const dataUrl = await resizeImageTo500(file);
    setEditImageData(dataUrl);
    setEditImagePreview(dataUrl);
  }

  const openEditModal = (a) => {
    setEditArticle({ ...a });
    const preview = a.image ? (a.image.startsWith('http') ? a.image : `${backend}${a.image}`) : '';
    setEditImagePreview(preview);
    setEditImageData(a.image || '');
    setShowEditModal(true);
  }

  const createWithImage = async () => {
    if (!title.trim() || !slug.trim()) { setError('Title and slug required'); return; }
    setLoading(true); setError(''); setMessage('');
    try {
      // If we have a resized data URL, send as multipart/form-data
      if (createImageData) {
        const form = new FormData();
        form.append('title', title);
        form.append('slug', slug);
        form.append('content', content);
        form.append('author', author);
        const blob = await (await fetch(createImageData)).blob();
        form.append('image', blob, 'image.jpg');
        await axios.post(`${backend}/api/articles`, form, { headers: { Authorization: 'Bearer ' + getToken() } });
      } else {
        await axios.post(`${backend}/api/articles`, { title, slug, content, author }, { headers: { Authorization: 'Bearer ' + getToken() } });
      }
      setTitle(''); setSlug(''); setContent(''); setAuthor(''); setCreateImageData(''); setCreateImagePreview('');
      setShowCreateModal(false);
      setMessage('Article created successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
      fetchArticles();
    } catch (err) {
      setError('Failed to create article');
      setMessageType('error');
    } finally { setLoading(false); }
  }

  const updateWithImage = async () => {
    if (!editArticle) return;
    const id = editArticle.id || editArticle._id || editArticle.id;
    setLoading(true); setError(''); setMessage('');
    try {
      // Use multipart if we have an image blob, otherwise send JSON
      if (editImageData && editImageData.startsWith('data:')) {
        const form = new FormData();
        form.append('title', editArticle.title);
        form.append('slug', editArticle.slug);
        form.append('content', editArticle.content);
        form.append('author', editArticle.author);
        const blob = await (await fetch(editImageData)).blob();
        form.append('image', blob, 'image.jpg');
        await axios.put(`${backend}/api/articles/${id}`, form, { headers: { Authorization: 'Bearer ' + getToken() } });
      } else {
        const payload = { title: editArticle.title, slug: editArticle.slug, content: editArticle.content, author: editArticle.author };
        if (editImageData) payload.image = editImageData;
        await axios.put(`${backend}/api/articles/${id}`, payload, { headers: { Authorization: 'Bearer ' + getToken() } });
      }
      setShowEditModal(false);
      setEditArticle(null);
      setEditImageData(''); setEditImagePreview('');
      setMessage('Article updated successfully');
      setMessageType('success');
      setTimeout(() => setMessage(''), 3000);
      fetchArticles();
    } catch (err) {
      setError('Failed to update article');
      setMessageType('error');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:underline">← Back to Admin</Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Articles Management</h1>

        {error && <div className="mb-4 p-4 rounded bg-red-50 text-red-700">{error}</div>}
        {message && <div className={`mb-4 p-4 rounded ${messageType === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>{message}</div>}

        {/* Create button + modal */}
        <div className="mb-8 flex justify-end">
          <button onClick={() => setShowCreateModal(true)} className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md">+ New Article</button>
        </div>

        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowCreateModal(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Create New Article</h3>
                <button onClick={() => setShowCreateModal(false)} className="text-gray-600 hover:text-gray-900">Close</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input placeholder="Article title" value={title} onChange={e => setTitle(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input placeholder="article-slug" value={slug} onChange={e => setSlug(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input placeholder="Author name" value={author} onChange={e => setAuthor(e.target.value)} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea placeholder="Article content" value={content} onChange={e => setContent(e.target.value)} rows={6} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (500x500)</label>
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await handleCreateImage(f); } }} />
                  {createImagePreview && <img src={createImagePreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />}
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={async () => { await createWithImage(); }} disabled={loading} className={`flex-1 inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-75' : ''}`}>{loading ? 'Creating...' : 'Create Article'}</button>
                  <button onClick={() => setShowCreateModal(false)} className="inline-flex justify-center items-center bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-md">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showEditModal && editArticle && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black opacity-40" onClick={() => setShowEditModal(false)} />
            <div className="relative bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold">Edit Article</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-600 hover:text-gray-900">Close</button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input placeholder="Article title" value={editArticle.title} onChange={e => setEditArticle({ ...editArticle, title: e.target.value })} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                  <input placeholder="article-slug" value={editArticle.slug} onChange={e => setEditArticle({ ...editArticle, slug: e.target.value })} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
                  <input placeholder="Author name" value={editArticle.author} onChange={e => setEditArticle({ ...editArticle, author: e.target.value })} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea placeholder="Article content" value={editArticle.content} onChange={e => setEditArticle({ ...editArticle, content: e.target.value })} rows={6} className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image (500x500)</label>
                  <input type="file" accept="image/*" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { await handleEditImage(f); } }} />
                  {editImagePreview && <img src={editImagePreview} alt="preview" className="mt-2 w-32 h-32 object-cover rounded" />}
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={async () => { await updateWithImage(); }} disabled={loading} className={`flex-1 inline-flex justify-center items-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md ${loading ? 'opacity-75' : ''}`}>{loading ? 'Updating...' : 'Update Article'}</button>
                  <button onClick={() => setShowEditModal(false)} className="inline-flex justify-center items-center bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold py-2 px-4 rounded-md">Cancel</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Articles List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Existing Articles ({articles.length})</h2>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-12 px-8">
              <p className="text-gray-600">No articles yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left px-6 py-3 font-semibold text-gray-900">Image</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-900">Title</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-900">Slug</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-900">Author</th>
                        <th className="text-left px-6 py-3 font-semibold text-gray-900">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(a => (
                    <tr key={a.id} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="px-6 py-4">
                            {a.image ? (
                              <img src={(a.image && (a.image.startsWith('http') ? a.image : `${backend}${a.image}`))} alt="thumb" className="w-16 h-16 object-cover rounded" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No image</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-gray-900">{a.title}</td>
                          <td className="px-6 py-4 text-gray-600">{a.slug}</td>
                          <td className="px-6 py-4 text-gray-600">{a.author || '-'}</td>
                      <td className="px-6 py-4 flex gap-3">
                        <button onClick={() => openEditModal(a)} className="text-blue-600 hover:underline font-medium">Edit</button>
                        <button
                          onClick={() => remove(a.id)}
                          className="text-red-600 hover:text-red-700 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
