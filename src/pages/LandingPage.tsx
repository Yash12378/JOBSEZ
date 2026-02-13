import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layouts/MainLayout';
import { FileUpload } from '@/components/shared/FileUpload';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Target, TrendingUp, Briefcase, Award, Brain } from 'lucide-react';
import { uploadResume, saveResume, callAIService, createSession } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';

export default function LandingPage() {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(10);

    try {
      const sessionId = getSessionId();
      
      // Ensure session exists
      await createSession(sessionId);
      setUploadProgress(20);

      // Upload file to storage
      const uploadResult = await uploadResume(sessionId, file);
      if (!uploadResult) {
        throw new Error('Failed to upload resume');
      }
      setUploadProgress(40);

      // Extract text from PDF/DOC (simplified - in production, use proper parsing)
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const text = e.target?.result as string;
          setUploadProgress(60);

          // Call AI to parse resume
          const aiResponse = await callAIService({
            action: 'parse_resume',
            data: { resumeText: text.substring(0, 10000) }, // Limit text size
          });

          setUploadProgress(80);

          if (!aiResponse.success || !aiResponse.data) {
            throw new Error('Failed to parse resume');
          }

          // Save resume data
          await saveResume({
            session_id: sessionId,
            file_name: file.name,
            file_url: uploadResult.url,
            file_type: file.type,
            parsed_data: aiResponse.data,
            analysis_result: {},
          });

          setUploadProgress(100);
          toast.success('Resume uploaded and analyzed successfully!');
          
          // Navigate to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 500);
        } catch (error) {
          console.error('Error processing resume:', error);
          toast.error('Failed to process resume. Please try again.');
          setIsProcessing(false);
        }
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast.error('Failed to upload resume. Please try again.');
      setIsProcessing(false);
    }
  };

  const features = [
    {
      icon: Target,
      title: 'Skill Gap Analysis',
      description: 'AI-powered analysis identifies gaps between your current skills and market demand.',
    },
    {
      icon: TrendingUp,
      title: 'Personalized Learning',
      description: 'Get customized learning paths with course recommendations tailored to your goals.',
    },
    {
      icon: Briefcase,
      title: 'Job Matching',
      description: 'Discover relevant job opportunities that match your skills and experience.',
    },
    {
      icon: Brain,
      title: 'Mock Interviews',
      description: 'Practice with AI-generated interview questions and receive detailed feedback.',
    },
    {
      icon: Award,
      title: 'Skill Assessments',
      description: 'Test your knowledge and earn certifications to showcase your expertise.',
    },
    {
      icon: Sparkles,
      title: 'Career Guidance',
      description: 'Receive AI-driven career recommendations based on your profile and market trends.',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-accent/20 to-background py-20 md:py-32">
        <div className="container relative z-10">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Career Platform
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Transform Your Career with{' '}
              <span className="gradient-text">AI-Driven Guidance</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Upload your resume and unlock personalized skill analysis, learning paths, 
              job opportunities, and career guidance powered by advanced AI.
            </p>

            <div className="max-w-xl mx-auto">
              <FileUpload
                onFileSelect={handleFileSelect}
                isUploading={isProcessing}
                uploadProgress={uploadProgress}
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>Instant analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span>100% free</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-card">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything You Need to <span className="gradient-text">Advance Your Career</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive AI-powered tools to help you identify skills gaps, learn effectively, 
              and land your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <Card key={idx} className="organic-shadow transition-smooth hover:organic-shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to Accelerate Your Career Growth?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of professionals using JobEZpro to bridge skill gaps 
              and unlock new career opportunities.
            </p>
            <Button size="lg" className="text-lg px-8" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              Get Started Now
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
