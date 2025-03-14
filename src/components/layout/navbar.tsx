'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Kanban
} from 'lucide-react';
import DepartmentSelector from './department-selector';
import { useDepartmentsStore } from '@/store/use-departments-store';

const Navbar = () => {
  const pathname = usePathname();
  const { selectedDepartmentId } = useDepartmentsStore();
  
  // Uproszczona nawigacja - tylko trzy główne sekcje
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
      name: 'Notatki', 
      href: '/notes', 
      icon: <FileText className="h-5 w-5" /> 
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

          <div className="hidden md:flex md:items-center">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 mx-1 text-sm rounded-md 
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                >
                  {item.icon}
                  <span className="ml-2">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;