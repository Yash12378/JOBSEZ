import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Target, DollarSign, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getLatestResume, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { CareerRecommendation } from '@/types';

export default function CareerGuidancePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionId = getSessionId();
      const resume = await getLatestResume(sessionId);
      setHasResume(!!resume);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateGuidance = async () => {
    setGenerating(true);

    try {
      const sessionId = getSessionId();
      const resume = await getLatestResume(sessionId);

      if (!resume) {
        toast.error('Please upload your resume first');
        navigate('/');
        return;
      }

      const profile = resume.parsed_data?.personalInfo || {};
      const skills = resume.parsed_data?.skills || [];
      const experience = resume.parsed_data?.experience || [];

      // Call AI for career guidance
      const aiResponse = await callAIService({
        action: 'career_guidance',
        data: {
          profile,
          skills,
          experience,
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to generate career guidance');
      }

      const responseData = aiResponse.data as {
        recommendedCareers?: CareerRecommendation[];
      };

      setRecommendations(responseData.recommendedCareers || []);
      toast.success('Career recommendations generated!');
    } catch (error) {
      console.error('Error generating guidance:', error);
      toast.error('Failed to generate career guidance. Please try again.');
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-64 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!hasResume) {
    return (
      <MainLayout>
        <div className="container py-20">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-6">
                <AlertCircle className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold">No Resume Found</h1>
            <p className="text-lg text-muted-foreground">
              Please upload your resume first to receive personalized career guidance.
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

  const growthColors = {
    High: 'bg-primary text-primary-foreground',
    Medium: 'bg-secondary text-secondary-foreground',
    Low: 'bg-muted text-muted-foreground',
  };

  const trendColors = {
    Growing: 'text-primary',
    Stable: 'text-secondary',
    Declining: 'text-muted-foreground',
  };

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">AI Career Guidance</span>
          </h1>
          <p className="text-muted-foreground">
            Discover career paths that align with your skills, interests, and market demand.
          </p>
        </div>

        {/* Generate Button */}
        {recommendations.length === 0 && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Get Career Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Based on your skills, experience, and market trends, we'll recommend career paths 
                with high growth potential and strong alignment with your profile.
              </p>
              <Button
                onClick={handleGenerateGuidance}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Generating Recommendations...
                  </>
                ) : (
                  <>
                    Generate Career Guidance
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Career Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recommended Career Paths</h2>
              <Button variant="outline" onClick={handleGenerateGuidance} disabled={generating}>
                {generating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  'Regenerate'
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recommendations.map((career, idx) => (
                <Card key={idx} className="organic-shadow transition-smooth hover:organic-shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-xl">{career.title}</CardTitle>
                      <Badge className="bg-primary text-primary-foreground">
                        {career.matchScore}% Match
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">{career.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-accent">
                        <div className="flex items-center gap-2 mb-1">
                          <TrendingUp className="h-4 w-4 text-primary" />
                          <span className="text-xs text-muted-foreground">Growth</span>
                        </div>
                        <Badge className={growthColors[career.growthPotential]}>
                          {career.growthPotential}
                        </Badge>
                      </div>

                      <div className="p-3 rounded-lg bg-accent">
                        <div className="flex items-center gap-2 mb-1">
                          <Target className="h-4 w-4 text-secondary" />
                          <span className="text-xs text-muted-foreground">Demand</span>
                        </div>
                        <span className={`text-sm font-semibold ${trendColors[career.demandTrend]}`}>
                          {career.demandTrend}
                        </span>
                      </div>
                    </div>

                    {/* Salary */}
                    <div className="flex items-center gap-2 p-3 rounded-lg bg-accent">
                      <DollarSign className="h-4 w-4 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Average Salary</p>
                        <p className="text-sm font-semibold">{career.averageSalary}</p>
                      </div>
                    </div>

                    {/* Required Skills */}
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Required Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {career.requiredSkills.slice(0, 6).map((skill, skillIdx) => (
                          <Badge key={skillIdx} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Why Good Fit */}
                    <div className="rounded-lg bg-primary/10 p-3">
                      <p className="text-sm text-foreground">
                        <span className="font-semibold">Why this fits: </span>
                        {career.whyGoodFit}
                      </p>
                    </div>

                    {/* Match Score Visual */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Match Score</span>
                        <span className="font-medium">{career.matchScore}%</span>
                      </div>
                      <Progress value={career.matchScore} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Next Steps */}
            <Card className="organic-shadow">
              <CardHeader>
                <CardTitle>Next Steps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Ready to pursue one of these career paths? Here's what you can do next:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="w-full" onClick={() => navigate('/skill-gap')}>
                    <Target className="mr-2 h-4 w-4" />
                    Analyze Skills
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/learning-path')}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Learning Path
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/jobs')}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Find Jobs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
