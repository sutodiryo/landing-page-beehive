import axios from 'axios';

export default function ProjectPage({ project }) {
  if (!project) return <div>Project not found</div>
  return (
    <div style={{ fontFamily: 'Arial', padding: 20 }}>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      {project.url && <p>URL: <a href={project.url} target="_blank" rel="noreferrer">{project.url}</a></p>}
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
