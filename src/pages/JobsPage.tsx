import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { JobCard } from '@/components/shared/JobCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Briefcase, Search, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { getLatestResume, getJobMatchesBySession, saveJobMatches, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { JobMatch } from '@/types';

export default function JobsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [jobs, setJobs] = useState<JobMatch[]>([]);
  const [location, setLocation] = useState('India');
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const sessionId = getSessionId();
      const [resume, existingJobs] = await Promise.all([
        getLatestResume(sessionId),
        getJobMatchesBySession(sessionId, 20),
      ]);

      setHasResume(!!resume);
      setJobs(existingJobs);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchJobs = async () => {
    if (!hasResume) {
      toast.error('Please upload your resume first');
      navigate('/');
      return;
    }

    setSearching(true);

    try {
      const sessionId = getSessionId();
      const resume = await getLatestResume(sessionId);

      if (!resume) {
        throw new Error('Resume not found');
      }

      const skills = resume.parsed_data?.skills || [];
      const experience = resume.parsed_data?.experience || [];
      const experienceYears = experience.length > 0 ? `${experience.length}-${experience.length + 2} years` : '0-2 years';

      // Call AI to generate job matches
      const aiResponse = await callAIService({
        action: 'match_jobs',
        data: {
          skills,
          experience: experienceYears,
          location: location.trim() || 'India',
          targetRoles: [],
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to find job matches');
      }

      const responseData = aiResponse.data as {
        jobs?: Array<{
          title: string;
          company: string;
          location: string;
          type: string;
          experience: string;
          salary: string;
          description: string;
          requirements: string[];
          compatibilityScore: number;
          matchReason: string;
          applyUrl: string;
        }>;
      };

      const jobsData = responseData.jobs || [];

      // Save job matches
      const jobMatches = jobsData.map((job) => ({
        session_id: sessionId,
        resume_id: resume.id,
        job_title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        requirements: job.requirements,
        compatibility_score: job.compatibilityScore,
        match_details: {
          type: job.type,
          experience: job.experience,
          salary: job.salary,
          matchReason: job.matchReason,
          applyUrl: job.applyUrl,
        },
      }));

      const savedJobs = await saveJobMatches(jobMatches);
      setJobs(savedJobs);
      toast.success(`Found ${savedJobs.length} job matches!`);
    } catch (error) {
      console.error('Error searching jobs:', error);
      toast.error('Failed to find job matches. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-8 space-y-8">
          <Skeleton className="h-12 w-64 bg-muted" />
          <Skeleton className="h-40 bg-muted" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
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
              Please upload your resume first to find relevant job opportunities.
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
            <span className="gradient-text">Job Opportunities</span>
          </h1>
          <p className="text-muted-foreground">
            Discover jobs that match your skills, experience, and career goals.
          </p>
        </div>

        {/* Search Section */}
        <Card className="organic-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Find Job Matches
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Preferred Location</Label>
              <Input
                id="location"
                placeholder="e.g., Bangalore, Mumbai, Remote"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={searching}
              />
            </div>

            <Button
              onClick={handleSearchJobs}
              disabled={searching}
              className="w-full"
            >
              {searching ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Find Jobs
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Job Listings */}
        {jobs.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">
                {jobs.length} Job{jobs.length !== 1 ? 's' : ''} Found
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </div>
        ) : (
          <Card className="organic-shadow">
            <CardContent className="py-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <Briefcase className="h-12 w-12 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold">No Jobs Found Yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Click the "Find Jobs" button above to discover opportunities that match your profile.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
