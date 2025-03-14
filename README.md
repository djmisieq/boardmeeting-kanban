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

### 6. Cascading Goals View (Optional)
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

## Future Development Plans

- User authentication (OAuth)
- Integration with Microsoft 365 tools (Outlook, Teams, SharePoint)
- Analytical integration (Power BI, Excel)
- Process automation (Power Automate)