export default function getBackendUrl() {
  // Client-side: use public env var (points to localhost:4000 for browser)
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
  }

  // Server-side: try to detect if running inside Docker and use the compose service hostname
  try {
    // Delay requiring fs so bundlers don't include it for client builds
    const fs = require('fs');
    // Common Docker indicator
    if (fs.existsSync('/.dockerenv')) {
      return 'http://backend:4000';
    }
    // Fallback: inspect cgroup for docker/k8s hints
    try {
      const cgroup = fs.readFileSync('/proc/1/cgroup', 'utf8');
      if (/docker|kubepods|containerd/.test(cgroup)) return 'http://backend:4000';
    } catch (e) {
      // ignore
    }
  } catch (e) {
    // ignore
  }

  // Default to public env var or localhost
  return process.env.NEXT_PUBLIC_BACKEND || 'http://localhost:4000';
}
