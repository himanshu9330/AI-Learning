// This layout overrides the dashboard layout for the test runner.
// It renders children directly with no sidebar or top navbar,
// allowing the test page to control its own full-screen layout.
export default function TestRunnerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-sans">
            {children}
        </div>
    );
}
