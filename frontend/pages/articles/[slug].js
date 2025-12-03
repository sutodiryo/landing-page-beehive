import axios from 'axios';

export default function ArticlePage({ article }) {
  if (!article) return <div>Article not found</div>
  return (
    <div style={{ fontFamily: 'Arial', padding: 20 }}>
      <h1>{article.title}</h1>
      <p>{article.content}</p>
      <p>Author: {article.author}</p>
    </div>
  )
}

export async function getServerSideProps(ctx) {
  const backend = process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  const { slug } = ctx.params;
  try {
    const res = await axios.get(`${backend}/api/articles/${slug}`);
    return { props: { article: res.data } };
  } catch (err) {
    return { props: { article: null } };
  }
}
