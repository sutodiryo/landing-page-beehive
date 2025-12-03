import { useEffect, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState('');
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';

  const fetch = async () => {
    try {
      const res = await axios.get(`${backend}/api/projects`);
      setProjects(res.data);
    } catch (err) {
      setError(err?.response?.data?.message || 'Error fetching');
    }
  }

  useEffect(() => { fetch(); }, []);

  const remove = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${backend}/api/projects/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetch();
    } catch (err) {
      alert(err?.response?.data?.message || 'Error deleting');
    }
  }

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h2>Projects</h2>
      <p><Link href="/admin/projects/new">Create new project</Link></p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Title</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Slug</th>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projects.map(p => {
            const id = p.id || p._id || '';
            return (
              <tr key={id}>
                <td style={{ padding: '8px 0' }}>{p.title}</td>
                <td style={{ padding: '8px 0' }}>{p.slug}</td>
                <td style={{ padding: '8px 0' }}>
                  <Link href={`/admin/projects/edit?id=${id}`} className="" style={{ marginRight: 8 }}>Edit</Link>
                  <a href="#" onClick={(e) => { e.preventDefault(); remove(id); }} style={{ color: 'red' }}>Delete</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
