import Navbar from '@/components/layout/navbar';
import { Calendar, Search, Plus, FileText } from 'lucide-react';

// Mock data for meeting notes
const meetingNotes = [
  {
    id: 1,
    title: 'Weekly Team Meeting',
    date: '2025-03-12',
    participants: ['John D.', 'Sarah L.', 'Mike S.', 'Anna K.'],
    summary: 'Discussed project progress, blockers, and upcoming sprint planning.',
    tags: ['team', 'weekly'],
  },
  {
    id: 2,
    title: 'Project Kickoff: Mobile App Redesign',
    date: '2025-03-10',
    participants: ['John D.', 'Sarah L.', 'UX Team', 'Dev Team'],
    summary: 'Initial kickoff for the mobile app redesign project. Defined goals, timeline, and responsibilities.',
    tags: ['project', 'kickoff', 'design'],
  },
  {
    id: 3,
    title: 'Quarterly Review Q1 2025',
    date: '2025-03-05',
    participants: ['Management Team', 'Department Heads'],
    summary: 'Quarterly business review. Discussed KPIs, achievements, and plans for Q2.',
    tags: ['quarterly', 'review', 'management'],
  },
  {
    id: 4,
    title: 'Product Strategy Session',
    date: '2025-02-28',
    participants: ['Product Team', 'Marketing', 'Sales'],
    summary: 'Strategic session to align on product roadmap and go-to-market strategy for new features.',
    tags: ['strategy', 'product'],
  },
  {
    id: 5,
    title: 'Technical Debt Review',
    date: '2025-02-25',
    participants: ['Dev Team', 'Architects', 'QA Team'],
    summary: 'Review of current technical debt issues and prioritization for upcoming sprints.',
    tags: ['technical', 'development'],
  },
];

export default function NotesPage() {
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Meeting Notes</h1>
          
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-9 pr-4 py-2 border rounded-lg"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </div>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Note
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <h2 className="text-xl font-semibold">Recent Meeting Notes</h2>
              </div>
              
              <div className="divide-y dark:divide-gray-700">
                {meetingNotes.map((note) => (
                  <div key={note.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mt-1">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">{note.title}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {note.date}
                          </div>
                        </div>
                        <p className="mt-1 text-gray-600 dark:text-gray-300">{note.summary}</p>
                        <div className="mt-3 flex items-center">
                          <span className="text-sm text-gray-500 mr-2">Participants:</span>
                          <span className="text-sm">{note.participants.join(', ')}</span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {note.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium block mb-2">Date Range</label>
                  <div className="flex space-x-2">
                    <input
                      type="date"
                      className="flex-1 p-2 border rounded-lg text-sm"
                      placeholder="From"
                    />
                    <input
                      type="date"
                      className="flex-1 p-2 border rounded-lg text-sm"
                      placeholder="To"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Tags</label>
                  <div className="space-y-2">
                    {['team', 'project', 'weekly', 'quarterly', 'review', 'technical', 'design', 'strategy'].map((tag) => (
                      <div key={tag} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`tag-${tag}`}
                          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`tag-${tag}`} className="ml-2 text-sm">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium block mb-2">Participants</label>
                  <select className="w-full p-2 border rounded-lg text-sm">
                    <option value="">Any participant</option>
                    <option>John D.</option>
                    <option>Sarah L.</option>
                    <option>Mike S.</option>
                    <option>Anna K.</option>
                    <option>Management Team</option>
                    <option>Dev Team</option>
                    <option>UX Team</option>
                  </select>
                </div>
                
                <button className="w-full py-2 bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}