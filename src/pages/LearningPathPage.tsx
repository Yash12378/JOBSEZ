import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { LearningPathCard } from '@/components/shared/LearningPathCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Clock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getLatestSkillGap, getLearningPathsBySession, saveLearningPath, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { LearningPath, LearningRecommendation } from '@/types';

export default function LearningPathPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [hasSkillGap, setHasSkillGap] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionId = getSessionId();
      const [skillGap, existingPaths] = await Promise.all([
        getLatestSkillGap(sessionId),
        getLearningPathsBySession(sessionId),
      ]);

      setHasSkillGap(!!skillGap);
      setLearningPaths(existingPaths);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePath = async () => {
    setGenerating(true);

    try {
      const sessionId = getSessionId();
      const skillGap = await getLatestSkillGap(sessionId);

      if (!skillGap) {
        toast.error('Please complete skill gap analysis first');
        navigate('/skill-gap');
        return;
      }

      // Call AI to generate learning path
      const aiResponse = await callAIService({
        action: 'generate_learning_path',
        data: {
          skillGaps: skillGap.identified_gaps,
          targetRole: skillGap.target_role,
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to generate learning path');
      }

      const responseData = aiResponse.data as {
        learningPath?: LearningRecommendation[];
        totalDuration?: string;
      };

      // Save learning path
      const savedPath = await saveLearningPath({
        session_id: sessionId,
        skill_gap_id: skillGap.id,
        recommendations: (responseData.learningPath || []) as never[],
        priority_order: responseData.learningPath?.map((p) => p.skill) || [],
        estimated_duration: responseData.totalDuration || 'Not specified',
      });

      if (savedPath) {
        setLearningPaths([savedPath, ...learningPaths]);
        toast.success('Learning path generated successfully!');
      }
    } catch (error) {
      console.error('Error generating learning path:', error);
      toast.error('Failed to generate learning path. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-40 bg-muted" />
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!hasSkillGap) {
    return (
      <MainLayout>
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <AlertCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">No Skill Gap Analysis Found</h1>
            <p className="text-lg text-muted-foreground">
              Please complete your skill gap analysis first to generate a personalized learning roadmap.
            </p>
            <Button size="lg" onClick={() => navigate('/skill-gap')}>
              Analyze Skills
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const latestPath = learningPaths[0];

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Personalized Learning Roadmap</span>
          </h1>
          <p className="text-muted-foreground">
            Follow this AI-generated learning path to bridge your skill gaps and achieve your career goals.
          </p>
        </div>

        {/* Generate Button */}
        {learningPaths.length === 0 && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Generate Your Learning Path
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Based on your skill gap analysis, we'll create a personalized learning roadmap 
                with course recommendations, certifications, and resources.
              </p>
              <Button
                onClick={handleGeneratePath}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate Learning Path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Learning Path Overview */}
        {latestPath && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle>Learning Path Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent">
                  <div className="rounded-full bg-primary/10 p-3">
                    <BookOpen className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Skills</p>
                    <p className="text-2xl font-bold">{latestPath.recommendations?.length || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent">
                  <div className="rounded-full bg-secondary/10 p-3">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Duration</p>
                    <p className="text-2xl font-bold">{latestPath.estimated_duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 rounded-lg bg-accent">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Courses</p>
                    <p className="text-2xl font-bold">
                      {latestPath.recommendations?.reduce((sum, rec) => sum + (rec.courses?.length || 0), 0) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {learningPaths.length === 1 && (
                <Button
                  onClick={handleGeneratePath}
                  disabled={generating}
                  variant="outline"
                  className="w-full"
                >
                  {generating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>
                      Regenerate Learning Path
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* Learning Recommendations */}
        {latestPath && latestPath.recommendations && latestPath.recommendations.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Your Learning Journey</h2>
            {latestPath.recommendations.map((recommendation, idx) => (
              <LearningPathCard key={idx} recommendation={recommendation} />
            ))}
          </div>
        )}

        {/* Tips */}
        {latestPath && (
          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertDescription>
              <strong>Pro Tip:</strong> Focus on high-priority skills first. Dedicate consistent time 
              each week to learning, and practice what you learn through projects and exercises.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </MainLayout>
  );
}
