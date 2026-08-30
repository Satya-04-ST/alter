import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'ALTER | AI Academic Workspace & Multi-Persona Orchestrator',
  description:
    'Full-stack AI operations platform, degree-progress tracker, and multi-persona academic tutor grounded in your curriculum.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-void-950 text-slate-100 min-h-screen antialiased bg-cyber-grid selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="fixed inset-0 bg-radial-gradient pointer-events-none z-0" />
        <div className="relative z-10 min-h-screen flex flex-col">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
}
