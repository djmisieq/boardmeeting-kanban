import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Boardmeeting Kanban</h1>
          <p className="text-xl text-muted-foreground">
            Visual management of team meetings using Kanban boards
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8">
          {/* Task Management Card */}
          <Link href="/boards/tasks" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Task Management</h2>
              <p className="text-muted-foreground mb-4">
                Create, assign, and track tasks for your team
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Problem Management Card */}
          <Link href="/boards/problems" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Problem Tracking</h2>
              <p className="text-muted-foreground mb-4">
                Register, analyze, and solve problems effectively
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Improvement Ideas Card */}
          <Link href="/boards/ideas" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Improvement Ideas</h2>
              <p className="text-muted-foreground mb-4">
                Collect and implement improvement ideas
              </p>
              <div className="text-primary group-hover:underline">View board →</div>
            </div>
          </Link>
          
          {/* Dashboard Card */}
          <Link href="/dashboard" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Team Dashboard</h2>
              <p className="text-muted-foreground mb-4">
                Visualize team KPIs and metrics
              </p>
              <div className="text-primary group-hover:underline">View dashboard →</div>
            </div>
          </Link>
          
          {/* Meeting Notes Card */}
          <Link href="/notes" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Meeting Notes</h2>
              <p className="text-muted-foreground mb-4">
                Document and search meeting summaries
              </p>
              <div className="text-primary group-hover:underline">View notes →</div>
            </div>
          </Link>
          
          {/* Goals Card */}
          <Link href="/goals" className="group">
            <div className="border rounded-lg p-6 transition-all duration-300 hover:shadow-md">
              <h2 className="text-xl font-semibold mb-2">Team Goals</h2>
              <p className="text-muted-foreground mb-4">
                Define and track cascading goals
              </p>
              <div className="text-primary group-hover:underline">View goals →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}