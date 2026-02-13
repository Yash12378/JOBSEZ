import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold gradient-text">JobEZpro</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              AI-powered career guidance and upskilling platform for India's workforce.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/dashboard" className="hover:text-foreground transition-smooth">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/skill-gap" className="hover:text-foreground transition-smooth">
                  Skill Analysis
                </Link>
              </li>
              <li>
                <Link to="/learning-path" className="hover:text-foreground transition-smooth">
                  Learning Path
                </Link>
              </li>
              <li>
                <Link to="/jobs" className="hover:text-foreground transition-smooth">
                  Job Opportunities
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">Tools</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link to="/mock-interview" className="hover:text-foreground transition-smooth">
                  Mock Interview
                </Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-foreground transition-smooth">
                  Skill Assessment
                </Link>
              </li>
              <li>
                <Link to="/" className="hover:text-foreground transition-smooth">
                  Resume Analysis
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">About</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Supporting Skill India Mission</li>
              <li>Empowering Digital India</li>
              <li>Bridging Skill Gaps</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>© 2026 JobEZpro. Empowering careers through AI-driven guidance.</p>
        </div>
      </div>
    </footer>
  );
}
