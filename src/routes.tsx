import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import SkillGapPage from './pages/SkillGapPage';
import LearningPathPage from './pages/LearningPathPage';
import JobsPage from './pages/JobsPage';
import MockInterviewPage from './pages/MockInterviewPage';
import AssessmentPage from './pages/AssessmentPage';
import CareerGuidancePage from './pages/CareerGuidancePage';
import type { ReactNode } from 'react';

interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
}

const routes: RouteConfig[] = [
  {
    name: 'Landing',
    path: '/',
    element: <LandingPage />
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    name: 'Skill Gap Analysis',
    path: '/skill-gap',
    element: <SkillGapPage />
  },
  {
    name: 'Learning Path',
    path: '/learning-path',
    element: <LearningPathPage />
  },
  {
    name: 'Jobs',
    path: '/jobs',
    element: <JobsPage />
  },
  {
    name: 'Mock Interview',
    path: '/mock-interview',
    element: <MockInterviewPage />
  },
  {
    name: 'Assessment',
    path: '/assessment',
    element: <AssessmentPage />
  },
  {
    name: 'Career Guidance',
    path: '/career-guidance',
    element: <CareerGuidancePage />
  }
];

export default routes;
