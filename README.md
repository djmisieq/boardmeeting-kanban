# Boardmeeting Kanban

Front-end application for managing team meetings using visual Kanban boards, following the Boardmeeting methodology from Leanpassion.

## Features

### 1. Task Management Kanban Board
- Create tasks during meetings
- Drag-and-drop to change task status ("To Do", "In Progress", "Done")
- Assign tasks to team members, set deadlines, and add comments

### 2. Problem Management Kanban Board
- Submit problems through a form
- Track problem resolution stages ("New", "Analysis", "Corrective Actions", "Resolved")
- Assign responsible persons and set resolution deadlines

### 3. Improvement Ideas Kanban Board
- Submit improvement ideas
- Rate, comment, and prioritize ideas
- Track implementation process ("Idea", "Approved", "In Implementation", "Completed")

### 4. Team Dashboard
- Visualize KPIs (number of reported problems, problem resolution time, task completion percentage)
- Filter and personalize views
- Export data and reports

### 5. Meeting Documentation
- Create meeting summaries
- View history and search notes and decisions

### 6. Cross-Department Collaboration
- View and filter tasks, problems, and ideas across all departments
- Create and manage cross-department projects
- Assign tasks from different departments to projects
- Track project progress with milestones

### 7. Enhanced Collaboration Tools
- Comment system with threaded discussions
- @mentions to notify team members
- Change history tracking for all cards
- Real-time collaboration indicators

### 8. Cascading Goals View (Optional)
- Define team goals that can be aggregated at managerial and strategic levels
- Transparent view of team goals for high-level managers

## Tech Stack

- Next.js (React.js)
- Tailwind CSS
- Shadcn/UI Components
- Recharts for data visualization
- dnd-kit for drag & drop functionality
- Framer Motion for animations
- Lucide-react for icons
- Zustand for state management

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Run the development server with `npm run dev`
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Development Status

The application is currently in MVP (Minimum Viable Product) phase with the following components implemented:
- Basic Kanban boards functionality
- Cross-department project management
- Enhanced collaboration tools with comments and history tracking
- Department and user management

## Future Development Plans

- User authentication (OAuth)
- Integration with Microsoft 365 tools (Outlook, Teams, SharePoint)
- Notification system for mentions, due dates, and status changes
- Advanced reporting and analytics
- Integration with external analytics tools (Power BI, Excel)
- Process automation (Power Automate)