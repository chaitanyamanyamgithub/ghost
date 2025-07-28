import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BookOpenCheck, CalendarDays, Target, ShieldAlert, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const tasks = [
  { id: "task1", label: "Emergency protocol activated", checked: true },
  { id: "task2", label: "All messages deleted securely", checked: true },
  { id: "task3", label: "Room cleaned and sanitized", checked: true },
  { id: "task4", label: "Session terminated safely", checked: true },
  { id: "task5", label: "System ready for new session", checked: true },
];

export default function PanicView() {
  return (
    <div className="container mx-auto px-4 py-8 bg-background min-h-screen flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="relative">
              <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
              <CheckCircle className="h-6 w-6 text-green-500 absolute -bottom-1 -right-1 bg-background rounded-full" />
            </div>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl font-headline">
            🚨 Emergency Protocol Complete
          </h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            All sensitive data has been permanently deleted. Your privacy is protected.
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <ShieldAlert className="h-5 w-5 text-red-500" />
                <CardTitle className="text-red-700 dark:text-red-400">Security Status</CardTitle>
              </div>
              <CardDescription>Emergency deletion completed successfully.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center space-x-3">
                    <Checkbox id={task.id} checked={task.checked} disabled />
                    <Label htmlFor={task.id} className={cn("text-sm", task.checked && "text-green-600 dark:text-green-400")}>
                      {task.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 dark:border-green-800">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <CardTitle className="text-green-700 dark:text-green-400">System Status</CardTitle>
              </div>
              <CardDescription>All systems operational and secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              <div>
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">Data Deletion</Label>
                <Progress value={100} className="mt-2 h-2" />
              </div>
              <div>
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">Security Cleanup</Label>
                <Progress value={100} className="mt-2 h-2" />
              </div>
              <div>
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">System Reset</Label>
                <Progress value={100} className="mt-2 h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Information Card */}
        <Card className="border-blue-200 dark:border-blue-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpenCheck className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-blue-700 dark:text-blue-400">What Happened?</CardTitle>
            </div>
            <CardDescription>Emergency protocol successfully executed.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-2 text-sm text-foreground">
              <li><span className="font-semibold text-blue-600 dark:text-blue-400">All chat messages</span> have been permanently deleted from the database</li>
              <li><span className="font-semibold text-blue-600 dark:text-blue-400">Session data</span> has been cleared from your device</li>
              <li><span className="font-semibold text-blue-600 dark:text-blue-400">Room connections</span> have been safely terminated</li>
              <li><span className="font-semibold text-blue-600 dark:text-blue-400">No traces</span> of your conversation remain anywhere</li>
            </ul>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                🔒 <strong>Privacy Guaranteed:</strong> The emergency deletion is irreversible and affects all participants.
                You can safely continue using the system - no data recovery is possible.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
