import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Award, CheckCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';
import { saveSkillAssessment, updateSkillAssessment, getSkillAssessmentsBySession, callAIService } from '@/db/api';
import { getSessionId } from '@/lib/session';
import { toast } from 'sonner';
import type { SkillAssessment, AssessmentQuestion, AssessmentAnswer } from '@/types';

export default function AssessmentPage() {
  const [loading, setLoading] = useState(false);
  const [skillCategory, setSkillCategory] = useState('');
  const [currentAssessment, setCurrentAssessment] = useState<SkillAssessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [pastAssessments, setPastAssessments] = useState<SkillAssessment[]>([]);

  useEffect(() => {
    loadPastAssessments();
  }, []);

  const loadPastAssessments = async () => {
    try {
      const sessionId = getSessionId();
      const assessments = await getSkillAssessmentsBySession(sessionId);
      setPastAssessments(assessments);
    } catch (error) {
      console.error('Error loading past assessments:', error);
    }
  };

  const handleStartAssessment = async () => {
    if (!skillCategory.trim()) {
      toast.error('Please enter a skill category');
      return;
    }

    setLoading(true);

    try {
      const sessionId = getSessionId();

      // Call AI to generate assessment questions
      const aiResponse = await callAIService({
        action: 'skill_assessment',
        data: {
          skillCategory: skillCategory.trim(),
          difficulty: 'Mixed',
          questionCount: 10,
        },
      });

      if (!aiResponse.success || !aiResponse.data) {
        throw new Error('Failed to generate assessment questions');
      }

      const responseData = aiResponse.data as {
        questions?: AssessmentQuestion[];
      };

      const questions = (responseData.questions || []) as never[];

      // Save assessment
      const assessment = await saveSkillAssessment({
        session_id: sessionId,
        skill_category: skillCategory.trim(),
        questions,
        answers: [],
        results: {},
        completed: false,
      });

      if (assessment) {
        setCurrentAssessment(assessment);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        toast.success('Assessment started!');
      }
    } catch (error) {
      console.error('Error starting assessment:', error);
      toast.error('Failed to start assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentAssessment || !currentAnswer.trim()) {
      toast.error('Please select an answer');
      return;
    }

    try {
      const currentQuestion = currentAssessment.questions[currentQuestionIndex];
      const isCorrect = currentAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();

      // Update answers
      const updatedAnswers: AssessmentAnswer[] = [
        ...(currentAssessment.answers || []),
        {
          questionId: currentQuestion.id,
          answer: currentAnswer.trim(),
          isCorrect,
        },
      ];

      // Check if this was the last question
      const isLastQuestion = currentQuestionIndex === currentAssessment.questions.length - 1;

      if (isLastQuestion) {
        // Calculate results
        const correctCount = updatedAnswers.filter(ans => ans.isCorrect).length;
        const totalQuestions = currentAssessment.questions.length;
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Update assessment as completed
        const updated = await updateSkillAssessment(currentAssessment.id, {
          answers: updatedAnswers,
          score,
          completed: true,
          results: {
            totalQuestions,
            correctAnswers: correctCount,
            score,
          },
        });

        if (updated) {
          setCurrentAssessment(updated);
          toast.success('Assessment completed!');
          loadPastAssessments();
        }
      } else {
        // Move to next question
        const updated = await updateSkillAssessment(currentAssessment.id, {
          answers: updatedAnswers,
        });

        if (updated) {
          setCurrentAssessment(updated);
          setCurrentQuestionIndex(currentQuestionIndex + 1);
          setCurrentAnswer('');
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer. Please try again.');
    }
  };

  const handleNewAssessment = () => {
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setCurrentAnswer('');
    setSkillCategory('');
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];
  const progress = currentAssessment
    ? ((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100
    : 0;

  return (
    <MainLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">
            <span className="gradient-text">Skill Assessment</span>
          </h1>
          <p className="text-muted-foreground">
            Test your knowledge and earn certifications to showcase your expertise.
          </p>
        </div>

        {/* Start Assessment */}
        {!currentAssessment && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Start New Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="skillCategory">Skill Category</Label>
                <Input
                  id="skillCategory"
                  placeholder="e.g., JavaScript, Python, React, Data Analysis"
                  value={skillCategory}
                  onChange={(e) => setSkillCategory(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleStartAssessment}
                disabled={loading || !skillCategory.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4 animate-spin" />
                    Preparing Assessment...
                  </>
                ) : (
                  <>
                    Start Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Active Assessment */}
        {currentAssessment && !currentAssessment.completed && currentQuestion && (
          <div className="space-y-6">
            {/* Progress */}
            <Card className="organic-shadow">
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
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
                  <Badge>{currentQuestion.difficulty}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentQuestion.type === 'MCQ' && currentQuestion.options && (
                  <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                    {currentQuestion.options.map((option, idx) => (
                      <div key={idx} className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-smooth">
                        <RadioGroupItem value={option} id={`option-${idx}`} />
                        <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}

                {currentQuestion.type === 'True-False' && (
                  <RadioGroup value={currentAnswer} onValueChange={setCurrentAnswer}>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-smooth">
                      <RadioGroupItem value="True" id="true" />
                      <Label htmlFor="true" className="flex-1 cursor-pointer">
                        True
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-accent transition-smooth">
                      <RadioGroupItem value="False" id="false" />
                      <Label htmlFor="false" className="flex-1 cursor-pointer">
                        False
                      </Label>
                    </div>
                  </RadioGroup>
                )}

                {currentQuestion.type === 'Short-Answer' && (
                  <div className="space-y-2">
                    <Label htmlFor="answer">Your Answer</Label>
                    <Input
                      id="answer"
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                    />
                  </div>
                )}

                <Button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim()}
                  className="w-full"
                >
                  Submit Answer
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Completed Assessment */}
        {currentAssessment && currentAssessment.completed && (
          <div className="space-y-6">
            <Card className="organic-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <CheckCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle>Assessment Completed!</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {currentAssessment.skill_category} Assessment
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Score</p>
                    <p className="text-3xl font-bold text-primary">{currentAssessment.score}%</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Correct</p>
                    <p className="text-3xl font-bold text-primary">
                      {currentAssessment.results?.correctAnswers || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-accent">
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="text-3xl font-bold">{currentAssessment.results?.totalQuestions || 0}</p>
                  </div>
                </div>

                <Button onClick={handleNewAssessment} className="w-full">
                  Take Another Assessment
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>

            {/* Detailed Results */}
            <Card className="organic-shadow">
              <CardHeader>
                <CardTitle>Detailed Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentAssessment.answers?.map((answer, idx) => {
                  const question = currentAssessment.questions.find(q => q.id === answer.questionId);
                  return (
                    <div key={idx} className="p-4 rounded-lg border border-border space-y-3">
                      <div className="flex items-start justify-between">
                        <p className="font-medium flex-1">{question?.question}</p>
                        {answer.isCorrect ? (
                          <CheckCircle className="h-5 w-5 text-primary shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-destructive shrink-0" />
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-muted-foreground">
                          Your answer: <span className="font-medium text-foreground">{answer.answer}</span>
                        </p>
                        {!answer.isCorrect && (
                          <p className="text-muted-foreground">
                            Correct answer: <span className="font-medium text-primary">{question?.correctAnswer}</span>
                          </p>
                        )}
                        {question?.explanation && (
                          <p className="text-muted-foreground pt-2 border-t border-border">
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Past Assessments */}
        {pastAssessments.length > 0 && !currentAssessment && (
          <Card className="organic-shadow">
            <CardHeader>
              <CardTitle>Past Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pastAssessments.slice(0, 5).map((assessment) => (
                  <div
                    key={assessment.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-accent transition-smooth"
                  >
                    <div>
                      <p className="font-medium">{assessment.skill_category}</p>
                      <p className="text-sm text-muted-foreground">
                        {assessment.questions.length} questions • {assessment.completed ? 'Completed' : 'In Progress'}
                      </p>
                    </div>
                    {assessment.score !== undefined && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{assessment.score}%</p>
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
