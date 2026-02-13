// Database types matching Supabase schema

export interface Session {
  id: string;
  session_id: string;
  created_at: string;
  last_active: string;
  user_data: Record<string, unknown>;
}

export interface Resume {
  id: string;
  session_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  parsed_data: ParsedResumeData;
  analysis_result: ResumeAnalysis;
  created_at: string;
}

export interface ParsedResumeData {
  personalInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
  };
  summary?: string;
  skills?: string[];
  experience?: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education?: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications?: string[];
  strengths?: string[];
  improvements?: string[];
}

export interface ResumeAnalysis {
  strengths?: string[];
  improvements?: string[];
  overallScore?: number;
  recommendations?: string[];
}

export interface SkillGap {
  id: string;
  session_id: string;
  resume_id?: string;
  current_skills: string[];
  target_role: string;
  identified_gaps: SkillGapDetail[];
  market_demand: MarketDemand;
  created_at: string;
}

export interface SkillGapDetail {
  skill: string;
  importance: 'High' | 'Medium' | 'Low';
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'None';
  targetLevel: 'Intermediate' | 'Advanced' | 'Expert';
  priority: number;
}

export interface MarketDemand {
  trending?: string[];
  essential?: string[];
  nice_to_have?: string[];
}

export interface LearningPath {
  id: string;
  session_id: string;
  skill_gap_id?: string;
  recommendations: LearningRecommendation[];
  priority_order: string[];
  estimated_duration: string;
  created_at: string;
}

export interface LearningRecommendation {
  skill: string;
  priority: number;
  courses: Course[];
  certifications: string[];
  estimatedTime: string;
  resources: string[];
}

export interface Course {
  title: string;
  provider: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  topics: string[];
}

export interface MockInterview {
  id: string;
  session_id: string;
  job_role: string;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  feedback: InterviewFeedback;
  score?: number;
  completed: boolean;
  created_at: string;
}

export interface InterviewQuestion {
  id: number;
  question: string;
  type: 'Technical' | 'Behavioral' | 'Situational';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  expectedPoints: string[];
}

export interface InterviewAnswer {
  questionId: number;
  answer: string;
  score?: number;
  feedback?: string;
}

export interface InterviewFeedback {
  overallScore?: number;
  strengths?: string[];
  improvements?: string[];
  detailedFeedback?: string;
}

export interface SkillAssessment {
  id: string;
  session_id: string;
  skill_category: string;
  questions: AssessmentQuestion[];
  answers: AssessmentAnswer[];
  results: AssessmentResults;
  score?: number;
  completed: boolean;
  created_at: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'MCQ' | 'True-False' | 'Short-Answer';
  options?: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface AssessmentAnswer {
  questionId: number;
  answer: string;
  isCorrect?: boolean;
}

export interface AssessmentResults {
  totalQuestions?: number;
  correctAnswers?: number;
  score?: number;
  categoryBreakdown?: Record<string, number>;
  recommendations?: string[];
}

export interface JobMatch {
  id: string;
  session_id: string;
  resume_id?: string;
  job_title: string;
  company?: string;
  location?: string;
  description?: string;
  requirements: string[];
  compatibility_score?: number;
  match_details: JobMatchDetails;
  created_at: string;
}

export interface JobMatchDetails {
  type?: string;
  experience?: string;
  salary?: string;
  matchReason?: string;
  applyUrl?: string;
}

// AI Service types
export interface AIRequest {
  action: 'parse_resume' | 'analyze_skills' | 'generate_learning_path' | 'career_guidance' | 'mock_interview' | 'evaluate_answer' | 'skill_assessment' | 'match_jobs';
  data: Record<string, unknown>;
}

export interface AIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface CareerRecommendation {
  title: string;
  matchScore: number;
  description: string;
  requiredSkills: string[];
  growthPotential: 'High' | 'Medium' | 'Low';
  averageSalary: string;
  demandTrend: 'Growing' | 'Stable' | 'Declining';
  whyGoodFit: string;
}
