import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Sparkles } from 'lucide-react';

export function Header() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold gradient-text">JobEZpro</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Dashboard
          </Link>
          <Link to="/skill-gap" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Skill Analysis
          </Link>
          <Link to="/learning-path" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Learning Path
          </Link>
          <Link to="/jobs" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Jobs
          </Link>
          <Link to="/mock-interview" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Mock Interview
          </Link>
          <Link to="/assessment" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
            Assessment
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64">
            <nav className="flex flex-col gap-4 mt-8">
              <Link to="/dashboard" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Dashboard
              </Link>
              <Link to="/skill-gap" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Skill Analysis
              </Link>
              <Link to="/learning-path" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Learning Path
              </Link>
              <Link to="/jobs" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Jobs
              </Link>
              <Link to="/mock-interview" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Mock Interview
              </Link>
              <Link to="/assessment" className="text-sm font-medium text-foreground/80 hover:text-foreground transition-smooth">
                Assessment
              </Link>
            </nav>
          </SheetContent>
        </Sheet>

        {!isHome && (
          <Link to="/">
            <Button variant="default" className="hidden md:flex">
              Upload Resume
            </Button>
          </Link>
        )}
      </div>
    </header>
  );
}
