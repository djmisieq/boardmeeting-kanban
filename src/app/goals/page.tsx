import Navbar from '@/components/layout/navbar';
import { CheckCircle, Clock, AlertCircle, Plus } from 'lucide-react';

// Mock data for team goals
const teamGoals = [
  {
    id: 1,
    title: 'Improve Customer Satisfaction Score',
    description: 'Increase CSAT score from 4.2 to 4.5 by the end of Q2',
    status: 'on-track',
    progress: 40,
    dueDate: '2025-06-30',
    owner: 'Customer Success Team',
    alignedWith: 'Increase Customer Retention',
    subgoals: [
      { id: 11, title: 'Implement customer feedback system', status: 'completed', progress: 100 },
      { id: 12, title: 'Conduct customer journey mapping', status: 'on-track', progress: 70 },
      { id: 13, title: 'Train support team on new protocols', status: 'at-risk', progress: 20 },
    ]
  },
  {
    id: 2,
    title: 'Reduce Bug Resolution Time',
    description: 'Decrease average bug resolution time from 5 days to 3 days',
    status: 'on-track',
    progress: 65,
    dueDate: '2025-05-15',
    owner: 'Development Team',
    alignedWith: 'Improve Product Quality',
    subgoals: [
      { id: 21, title: 'Implement automated testing', status: 'completed', progress: 100 },
      { id: 22, title: 'Refine bug triage process', status: 'on-track', progress: 80 },
      { id: 23, title: 'Add monitoring for critical systems', status: 'on-track', progress: 60 },
    ]
  },
  {
    id: 3,
    title: 'Launch Mobile App Redesign',
    description: 'Complete the mobile app redesign project with 99% feature parity',
    status: 'at-risk',
    progress: 30,
    dueDate: '2025-07-15',
    owner: 'Product Team',
    alignedWith: 'Expand Mobile User Base',
    subgoals: [
      { id: 31, title: 'Complete UX research', status: 'completed', progress: 100 },
      { id: 32, title: 'Finalize design system', status: 'on-track', progress: 90 },
      { id: 33, title: 'Develop core features', status: 'at-risk', progress: 35 },
      { id: 34, title: 'QA testing and bug fixes', status: 'not-started', progress: 0 },
    ]
  },
  {
    id: 4,
    title: 'Implement New Onboarding Process',
    description: 'Roll out improved employee onboarding process with automated workflows',
    status: 'completed',
    progress: 100,
    dueDate: '2025-03-01',
    owner: 'HR Team',
    alignedWith: 'Improve Employee Experience',
    subgoals: [
      { id: 41, title: 'Document onboarding checklist', status: 'completed', progress: 100 },
      { id: 42, title: 'Create training materials', status: 'completed', progress: 100 },
      { id: 43, title: 'Implement onboarding software', status: 'completed', progress: 100 },
    ]
  },
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'on-track':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'at-risk':
      return <AlertCircle className="h-5 w-5 text-amber-500" />;
    case 'not-started':
      return <Clock className="h-5 w-5 text-gray-400" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return 'Completed';
    case 'on-track':
      return 'On Track';
    case 'at-risk':
      return 'At Risk';
    case 'not-started':
      return 'Not Started';
    default:
      return status;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    case 'on-track':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
    case 'at-risk':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100';
    case 'not-started':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100';
  }
};

export default function GoalsPage() {
  return (
    <div>
      <Navbar />
      
      <div className="max-w-screen-xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Team Goals</h1>
          
          <div className="flex space-x-4">
            <div>
              <select className="px-4 py-2 border rounded-lg">
                <option value="all">All Goals</option>
                <option value="on-track">On Track</option>
                <option value="at-risk">At Risk</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="h-4 w-4 mr-2" />
              New Goal
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Goal Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-3xl font-bold mb-1">{teamGoals.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Goals</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-green-600 mb-1">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-blue-600 mb-1">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">On Track</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="text-3xl font-bold text-amber-600 mb-1">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">At Risk</div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          {teamGoals.map((goal) => (
            <div key={goal.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{goal.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-sm ${getStatusColor(goal.status)}`}>
                    <div className="flex items-center">
                      {getStatusIcon(goal.status)}
                      <span className="ml-1">{getStatusText(goal.status)}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {goal.description}
                </p>
                
                <div className="flex flex-wrap gap-y-2 text-sm">
                  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                    <span className="text-gray-500 dark:text-gray-400">Due: </span>
                    {goal.dueDate}
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                    <span className="text-gray-500 dark:text-gray-400">Owner: </span>
                    {goal.owner}
                  </div>
                  <div className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4">
                    <span className="text-gray-500 dark:text-gray-400">Aligned with: </span>
                    {goal.alignedWith}
                  </div>
                </div>
                
                <div className="mt-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">{goal.progress}% Complete</span>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        goal.status === 'completed' ? 'bg-green-500' : 
                        goal.status === 'at-risk' ? 'bg-amber-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="font-medium mb-3">Subgoals</h4>
                <div className="space-y-2">
                  {goal.subgoals.map((subgoal) => (
                    <div key={subgoal.id} className="flex items-center justify-between">
                      <div className="flex items-center">
                        {getStatusIcon(subgoal.status)}
                        <span className="ml-2">{subgoal.title}</span>
                      </div>
                      <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            subgoal.status === 'completed' ? 'bg-green-500' : 
                            subgoal.status === 'at-risk' ? 'bg-amber-500' : 
                            subgoal.status === 'on-track' ? 'bg-blue-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${subgoal.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}