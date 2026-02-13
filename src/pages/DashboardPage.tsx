import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Target, 
  BookOpen, 
  Briefcase, 
  Award, 
  TrendingUp,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { getLatestResume, getLatestSkillGap, getLearningPathsBySession, getMockInterviewsBySession, getSkillAssessmentsBySession, getJobMatchesBySession } from '@/db/api';
import { getSessionId } from '@/lib/session';
import type { Resume, SkillGap, LearningPath, MockInterview, SkillAssessment, JobMatch } from '@/types';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<Resume | null>(null);
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [mockInterviews, setMockInterviews] = useState<MockInterview[]>([]);
  const [assessments, setAssessments] = useState<SkillAssessment[]>([]);
  const [jobMatches, setJobMatches] = useState<JobMatch[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const sessionId = getSessionId();
      
      const [
        resumeData,
        skillGapData,
        learningPathsData,
        mockInterviewsData,
        assessmentsData,
        jobMatchesData,
      ] = await Promise.all([
        getLatestResume(sessionId),
        getLatestSkillGap(sessionId),
        getLearningPathsBySession(sessionId),
        getMockInterviewsBySession(sessionId),
        getSkillAssessmentsBySession(sessionId),
        getJobMatchesBySession(sessionId, 5),
      ]);

      setResume(resumeData);
      setSkillGap(skillGapData);
      setLearningPaths(learningPathsData);
      setMockInterviews(mockInterviewsData);
      setAssessments(assessmentsData);
      setJobMatches(jobMatchesData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const completedInterviews = mockInterviews.filter(i => i.completed).length;
  const completedAssessments = assessments.filter(a => a.completed).length;
  const averageInterviewScore = mockInterviews.length > 0
    ? mockInterviews.reduce((sum, i) => sum + (i.score || 0), 0) / mockInterviews.length
    : 0;

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-12 w-64 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-40 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!resume) {
    return (
      <MainLayout>
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">Welcome to JobEZpro!</h1>
            <p className="text-lg text-muted-foreground">
              Start your career journey by uploading your resume. Our AI will analyze it 
              and provide personalized recommendations.
            </p>
            <Button size="lg" onClick={() => navigate('/')}>
              Upload Resume
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const skills = resume.parsed_data?.skills || [];
  const experience = resume.parsed_data?.experience || [];

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            Welcome back, <span className="gradient-text">{resume.parsed_data?.personalInfo?.name || 'Professional'}</span>!
          </h1>
          <p className="text-muted-foreground">
            Track your progress and continue your career development journey.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="organic-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Skills Identified</p>
                  <p className="text-3xl font-bold text-primary">{skills.length}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="organic-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Learning Paths</p>
                  <p className="text-3xl font-bold text-secondary">{learningPaths.length}</p>
                </div>
                <div className="rounded-full bg-secondary/10 p-3">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="organic-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Mock Interviews</p>
                  <p className="text-3xl font-bold text-primary">{completedInterviews}</p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="organic-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assessments</p>
                  <p className="text-3xl font-bold text-secondary">{completedAssessments}</p>
                </div>
                <div className="rounded-full bg-secondary/10 p-3">
                  <Award className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/skill-gap')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Analyze Skill Gaps</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Identify gaps between your current skills and market demand.
              </p>
              <Button variant="outline" className="w-full">
                Start Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/learning-path')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-3">
                  <BookOpen className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Learning Roadmap</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized course recommendations and learning paths.
              </p>
              <Button variant="outline" className="w-full">
                View Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/jobs')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Find Jobs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Discover job opportunities that match your skills and goals.
              </p>
              <Button variant="outline" className="w-full">
                Browse Jobs
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/mock-interview')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-3">
                  <Sparkles className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Mock Interview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Practice interviews with AI and get instant feedback.
              </p>
              <Button variant="outline" className="w-full">
                Start Practice
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/assessment')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Skill Assessment</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Test your knowledge and earn skill certifications.
              </p>
              <Button variant="outline" className="w-full">
                Take Test
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          <Card className="organic-shadow transition-smooth hover:organic-shadow-lg cursor-pointer" onClick={() => navigate('/career-guidance')}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-secondary/10 p-3">
                  <TrendingUp className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Career Guidance</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Get AI-powered career recommendations and insights.
              </p>
              <Button variant="outline" className="w-full">
                Get Guidance
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Progress Overview */}
        {averageInterviewScore > 0 && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle>Your Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Interview Performance</span>
                  <span className="font-medium">{averageInterviewScore.toFixed(0)}%</span>
                </div>
                <Progress value={averageInterviewScore} className="h-2" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Job Matches */}
        {jobMatches.length > 0 && (
          <Card className="organic-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Recent Job Matches</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/jobs')}>
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {jobMatches.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-smooth">
                    <div>
                      <p className="font-medium">{job.job_title}</p>
                      <p className="text-sm text-muted-foreground">{job.company}</p>
                    </div>
                    {job.compatibility_score && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-primary">{job.compatibility_score}%</p>
                        <p className="text-xs text-muted-foreground">Match</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
