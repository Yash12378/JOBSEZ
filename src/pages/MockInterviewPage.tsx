import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, MessageSquare, CheckCircle, ArrowRight } from 'lucide-react';
import { saveMockInterview, updateMockInterview, getMockInterviewsBySession, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { MockInterview, InterviewQuestion, InterviewAnswer } from '@/types';

export default function MockInterviewPage() {
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState('');
  const [currentInterview, setCurrentInterview] = useState<MockInterview | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [pastInterviews, setPastInterviews] = useState<MockInterview[]>([]);

  useEffect(() => {
    loadPastInterviews();
  }, []);

  const loadPastInterviews = async () => {
    try {
      const sessionId = getSessionId();
      const interviews = await getMockInterviewsBySession(sessionId);
      setPastInterviews(interviews);
    } catch (error) {
      console.error('Error loading past interviews:', error);
    }
  };

  const handleStartInterview = async () => {
    if (!jobRole.trim()) {
      toast.error('Please enter a job role');
      return;
    }

    setLoading(true);

    try {
      const sessionId = getSessionId();

      // Call AI to generate interview questions
      const aiResponse = await callAIService({
        action: 'mock_interview',
        data: {
          jobRole: jobRole.trim(),
          experienceLevel: 'Mid-level',
          questionCount: 5,
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to generate interview questions');
      }

      const responseData = aiResponse.data as {
        questions?: InterviewQuestion[];
      };

      const questions = (responseData.questions || []) as never[];

      // Save mock interview
      const interview = await saveMockInterview({
        session_id: sessionId,
        job_role: jobRole.trim(),
        questions,
        answers: [],
        feedback: {},
        completed: false,
      });

      if (interview) {
        setCurrentInterview(interview);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        toast.success('Interview started! Good luck!');
      }
    } catch (error) {
      console.error('Error starting interview:', error);
      toast.error('Failed to start interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentInterview || !currentAnswer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    setIsEvaluating(true);

    try {
      const currentQuestion = currentInterview.questions[currentQuestionIndex];

      // Call AI to evaluate answer
      const aiResponse = await callAIService({
        action: 'evaluate_answer',
        data: {
          question: currentQuestion.question,
          expectedPoints: currentQuestion.expectedPoints,
          answer: currentAnswer.trim(),
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to evaluate answer');
      }

      const evaluation = aiResponse.data as {
        score?: number;
        feedback?: string;
      };

      // Update answers
      const updatedAnswers: InterviewAnswer[] = [
        ...(currentInterview.answers || []),
        {
          questionId: currentQuestion.id,
          answer: currentAnswer.trim(),
          score: evaluation.score,
          feedback: evaluation.feedback,
        },
      ];

      // Check if this was the last question
      const isLastQuestion = currentQuestionIndex === currentInterview.questions.length - 1;

      if (isLastQuestion) {
        // Calculate overall score
        const totalScore = updatedAnswers.reduce((sum, ans) => sum + (ans.score || 0), 0);
        const averageScore = Math.round(totalScore / updatedAnswers.length);

        // Update interview as completed
        const updated = await updateMockInterview(currentInterview.id, {
          answers: updatedAnswers,
          score: averageScore,
          completed: true,
          feedback: {
            overallScore: averageScore,
            strengths: [],
            improvements: [],
            detailedFeedback: 'Interview completed successfully!',
          },
        });

        if (updated) {
          setCurrentInterview(updated);
          toast.success('Interview completed!');
          loadPastInterviews();
        }
      } else {
        // Move to next question
        const updated = await updateMockInterview(currentInterview.id, {
          answers: updatedAnswers,
        });

        if (updated) {
          setCurrentInterview(updated);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCurrentAnswer('');
          toast.success('Answer submitted!');
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNewInterview = () => {
    setCurrentInterview(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setJobRole('');
  };

  const currentQuestion = currentInterview?.questions[currentQuestionIndex];
  const progress = currentInterview
    ? ((currentQuestionIndex + 1) / currentInterview.questions.length) * 100
    : 0;

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">AI Mock Interview</span>
          </h1>
          <p className="text-muted-foreground">
            Practice interviews with AI-generated questions and receive instant feedback.
          </p>
        </div>

        {/* Start Interview */}
        {!currentInterview && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Start New Interview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="jobRole">Job Role</Label>
                <Input
                  id="jobRole"
                  placeholder="e.g., Software Engineer, Product Manager, Data Analyst"
                  value={jobRole}
                  onChange={(e) => setJobRole(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleStartInterview}
                disabled={loading || !jobRole.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Interview...
                  </>
                ) : (
                  <>
                    Start Interview
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Interview */}
        {currentInterview && !currentInterview.completed && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <Card className="organic-shadow">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {currentInterview.questions.length}
                    </span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Question */}
            <Card className="organic-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
                  <Badge>{currentQuestion.type}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline">{currentQuestion.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="answer">Your Answer</Label>
                  <Textarea
                    id="answer"
                    placeholder="Type your answer here..."
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    disabled={isEvaluating}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={isEvaluating || !currentAnswer.trim()}
                  className="w-full"
                >
                  {isEvaluating ? (
                    <>
                      <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                      Evaluating...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Submit Answer
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completed Interview */}
        {currentInterview && currentInterview.completed && (
          <div className="space-y-6">
            <Card className="organic-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Interview Completed!</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Great job completing the interview for {currentInterview.job_role}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Overall Score</p>
                    <p className="text-3xl font-bold text-primary">{currentInterview.score}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Questions</p>
                    <p className="text-3xl font-bold">{currentInterview.questions.length}</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Answers</p>
                    <p className="text-3xl font-bold">{currentInterview.answers?.length || 0}</p>
                  </div>
                </div>

                <Button onClick={handleNewInterview} className="w-full">
                  Start New Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Detailed Feedback */}
            <Card className="organic-shadow">
              <CardHeader>
                <CardTitle>Detailed Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentInterview.answers?.map((answer, idx) => {
                  const question = currentInterview.questions.find(q => q.id === answer.questionId);
                  return (
                    <div key={idx} className="p-4 rounded-lg border border-border space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="font-medium">{question?.question}</p>
                        <Badge className="bg-primary text-primary-foreground">
                          {answer.score}%
                        </Badge>
                      </div>
                      {answer.feedback && (
                        <p className="text-sm text-muted-foreground">{answer.feedback}</p>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Past Interviews */}
        {pastInterviews.length > 0 && !currentInterview && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle>Past Interviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastInterviews.slice(0, 5).map((interview) => (
                  <div
                    key={interview.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-smooth"
                  >
                    <div>
                      <p className="font-medium">{interview.job_role}</p>
                      <p className="text-sm text-muted-foreground">
                        {interview.questions.length} questions • {interview.completed ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                    {interview.score && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{interview.score}%</p>
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
