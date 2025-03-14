import Link from 'next/link';
import { 
  LayoutDashboard, 
  CheckSquare, 
  AlertCircle, 
  Lightbulb, 
  FileText, 
  Target 
} from 'lucide-react';

const Navbar = () => {
  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Tasks', href: '/boards/tasks', icon: <CheckSquare className="h-5 w-5" /> },
    { name: 'Problems', href: '/boards/problems', icon: <AlertCircle className="h-5 w-5" /> },
    { name: 'Ideas', href: '/boards/ideas', icon: <Lightbulb className="h-5 w-5" /> },
    { name: 'Notes', href: '/notes', icon: <FileText className="h-5 w-5" /> },
    { name: 'Goals', href: '/goals', icon: <Target className="h-5 w-5" /> },
  ];

  return (
    <nav className="bg-white border-b dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link 
              href="/" 
              className="flex items-center font-bold text-xl"
            >
              Boardmeeting Kanban
            </Link>
          </div>

          <div className="hidden md:flex md:items-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center px-3 py-2 mx-1 text-sm rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {item.icon}
                <span className="ml-2">{item.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;