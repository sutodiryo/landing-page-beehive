export default function Footer() {
  return (
    <footer className="mt-auto w-full bg-gray-900 text-gray-300 py-12 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h3 className="text-white text-lg font-semibold mb-2">Company</h3>
          <p className="text-gray-400 text-sm">Modern company profile showcasing articles and projects built with modern tools.</p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Quick Links</h4>
          <ul className="text-gray-400 text-sm space-y-1">
            <li><a href="#projects" className="hover:text-white">Projects</a></li>
            <li><a href="#articles" className="hover:text-white">Articles</a></li>
            <li><a href="/admin/login" className="hover:text-white">Admin</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-2">Contact</h4>
          <p className="text-gray-400 text-sm">hello@company.example</p>
          <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Company Profile. All rights reserved.</p>
      </div>
    </footer>
  );
}
