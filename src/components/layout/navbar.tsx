'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Kanban,
  Briefcase,
  Settings
} from 'lucide-react';
import DepartmentSelector from './department-selector';
import { useDepartmentsStore } from '@/store/use-departments-store';

const Navbar = () => {
  const pathname = usePathname();
  const { selectedDepartmentId } = useDepartmentsStore();
  
  // Uproszczona nawigacja - tylko najważniejsze sekcje
  const navItems = [
    { 
      name: 'Tablica', 
      href: selectedDepartmentId ? `/board?departmentId=${selectedDepartmentId}` : '/board', 
      icon: <Kanban className="h-5 w-5" /> 
    },
    { 
      name: 'Dashboard', 
      href: selectedDepartmentId ? `/dashboard?departmentId=${selectedDepartmentId}` : '/dashboard', 
      icon: <LayoutDashboard className="h-5 w-5" /> 
    },
    { 
      name: 'Projekty', 
      href: '/projects', 
      icon: <Briefcase className="h-5 w-5" /> 
    },
    { 
      name: 'Notatki', 
      href: '/notes', 
      icon: <FileText className="h-5 w-5" /> 
    },
    { 
      name: 'Szablony', 
      href: '/templates', 
      icon: <Settings className="h-5 w-5" /> 
    }
  ];

  return (
    <nav className="bg-white border-b dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex items-center font-bold text-xl mr-6"
            >
              Boardmeeting Kanban
            </Link>
            
            <DepartmentSelector />
          </div>

          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`py-2 px-3 rounded-md text-sm font-medium flex items-center ${
                  pathname === item.href
                    ? 'bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;