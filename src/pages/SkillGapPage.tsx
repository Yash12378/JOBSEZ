import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { SkillCard } from '@/components/shared/SkillCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Target, TrendingUp, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { getLatestResume, getLatestSkillGap, saveSkillGap, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { SkillGap, SkillGapDetail } from '@/types';

export default function SkillGapPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [skillGap, setSkillGap] = useState<SkillGap | null>(null);
  const [currentSkills, setCurrentSkills] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionId = getSessionId();
      const [resume, existingSkillGap] = await Promise.all([
        getLatestResume(sessionId),
        getLatestSkillGap(sessionId),
      ]);

      if (resume?.parsed_data?.skills) {
        setCurrentSkills(resume.parsed_data.skills);
      }

      if (existingSkillGap) {
        setSkillGap(existingSkillGap);
        setTargetRole(existingSkillGap.target_role);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!targetRole.trim()) {
      toast.error('Please enter a target role');
      return;
    }

    if (currentSkills.length === 0) {
      toast.error('No skills found. Please upload your resume first.');
      return;
    }

    setAnalyzing(true);

    try {
      const sessionId = getSessionId();
      const resume = await getLatestResume(sessionId);

      // Call AI to analyze skill gaps
      const aiResponse = await callAIService({
        action: 'analyze_skills',
        data: {
          currentSkills,
          targetRole: targetRole.trim(),
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to analyze skills');
      }

      const responseData = aiResponse.data as {
        skillGaps?: SkillGapDetail[];
        marketDemand?: Record<string, unknown>;
      };

      // Save skill gap analysis
      const savedSkillGap = await saveSkillGap({
        session_id: sessionId,
        resume_id: resume?.id,
        current_skills: currentSkills,
        target_role: targetRole.trim(),
        identified_gaps: (responseData.skillGaps || []) as never[],
        market_demand: responseData.marketDemand || {},
      });

      if (savedSkillGap) {
        setSkillGap(savedSkillGap);
        toast.success('Skill gap analysis completed!');
      }
    } catch (error) {
      console.error('Error analyzing skills:', error);
      toast.error('Failed to analyze skills. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-40 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48 bg-muted" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentSkills.length === 0) {
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
              Please upload your resume first to analyze your skill gaps.
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

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Skill Gap Analysis</span>
          </h1>
          <p className="text-muted-foreground">
            Identify gaps between your current skills and market demand for your target role.
          </p>
        </div>

        {/* Analysis Form */}
        <Card className="organic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Analyze Your Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetRole">Target Job Role</Label>
              <Input
                id="targetRole"
                placeholder="e.g., Full Stack Developer, Data Scientist, Product Manager"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                disabled={analyzing}
              />
            </div>

            <div className="space-y-2">
              <Label>Your Current Skills ({currentSkills.length})</Label>
              <div className="flex flex-wrap gap-2 p-4 rounded-lg border border-border bg-muted/50">
                {currentSkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={analyzing || !targetRole.trim()}
              className="w-full"
            >
              {analyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Analyze Skill Gaps
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results */}
        {skillGap && (
          <>
            {/* Market Demand */}
            {skillGap.market_demand && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {skillGap.market_demand.trending && skillGap.market_demand.trending.length > 0 && (
                  <Card className="organic-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Trending Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {skillGap.market_demand.trending.map((skill, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {skillGap.market_demand.essential && skillGap.market_demand.essential.length > 0 && (
                  <Card className="organic-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5 text-secondary" />
                        Essential Skills
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {skillGap.market_demand.essential.map((skill, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-secondary" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {skillGap.market_demand.nice_to_have && skillGap.market_demand.nice_to_have.length > 0 && (
                  <Card className="organic-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Nice to Have
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {skillGap.market_demand.nice_to_have.map((skill, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Identified Gaps */}
            {skillGap.identified_gaps && skillGap.identified_gaps.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">Identified Skill Gaps</h2>
                  <Button onClick={() => navigate('/learning-path')}>
                    View Learning Path
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {skillGap.identified_gaps.map((gap, idx) => (
                    <SkillCard key={idx} skill={gap} />
                  ))}
                </div>
              </div>
            )}

            {/* Next Steps */}
            <Alert>
              <Sparkles className="h-4 w-4" />
              <AlertDescription>
                Ready to bridge these gaps? Generate a personalized learning roadmap to start your upskilling journey!
              </AlertDescription>
            </Alert>
          </>
        )}
      </div>
    </MainLayout>
  );
}
