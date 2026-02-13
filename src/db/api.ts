import { supabase } from './supabase';
import type {
  Session,
  Resume,
  SkillGap,
  LearningPath,
  MockInterview,
  SkillAssessment,
  JobMatch,
  AIRequest,
  AIResponse,
} from '@/types';

// Session Management
export async function createSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .insert({ session_id: sessionId })
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating session:', error);
    return null;
  }
  return data;
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching session:', error);
    return null;
  }
  return data;
}

export async function updateSessionActivity(sessionId: string): Promise<void> {
  await supabase
    .from('sessions')
    .update({ last_active: new Date().toISOString() })
    .eq('session_id', sessionId);
}

// Resume Management
export async function uploadResume(
  sessionId: string,
  file: File
): Promise<{ url: string; path: string } | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${sessionId}_${Date.now()}.${fileExt}`;
  const filePath = `resumes/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('app-9lzawza7xw5d_resumes_files')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('app-9lzawza7xw5d_resumes_files')
    .getPublicUrl(filePath);

  return { url: urlData.publicUrl, path: filePath };
}

export async function saveResume(resumeData: Partial<Resume>): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .insert(resumeData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving resume:', error);
    return null;
  }
  return data;
}

export async function getResumesBySession(sessionId: string): Promise<Resume[]> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching resumes:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getLatestResume(sessionId: string): Promise<Resume | null> {
  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest resume:', error);
    return null;
  }
  return data;
}

// Skill Gap Management
export async function saveSkillGap(skillGapData: Partial<SkillGap>): Promise<SkillGap | null> {
  const { data, error } = await supabase
    .from('skill_gaps')
    .insert(skillGapData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving skill gap:', error);
    return null;
  }
  return data;
}

export async function getSkillGapsBySession(sessionId: string): Promise<SkillGap[]> {
  const { data, error } = await supabase
    .from('skill_gaps')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching skill gaps:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getLatestSkillGap(sessionId: string): Promise<SkillGap | null> {
  const { data, error } = await supabase
    .from('skill_gaps')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching latest skill gap:', error);
    return null;
  }
  return data;
}

// Learning Path Management
export async function saveLearningPath(pathData: Partial<LearningPath>): Promise<LearningPath | null> {
  const { data, error } = await supabase
    .from('learning_paths')
    .insert(pathData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving learning path:', error);
    return null;
  }
  return data;
}

export async function getLearningPathsBySession(sessionId: string): Promise<LearningPath[]> {
  const { data, error } = await supabase
    .from('learning_paths')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching learning paths:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// Mock Interview Management
export async function saveMockInterview(interviewData: Partial<MockInterview>): Promise<MockInterview | null> {
  const { data, error } = await supabase
    .from('mock_interviews')
    .insert(interviewData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving mock interview:', error);
    return null;
  }
  return data;
}

export async function updateMockInterview(id: string, updates: Partial<MockInterview>): Promise<MockInterview | null> {
  const { data, error } = await supabase
    .from('mock_interviews')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating mock interview:', error);
    return null;
  }
  return data;
}

export async function getMockInterviewsBySession(sessionId: string): Promise<MockInterview[]> {
  const { data, error } = await supabase
    .from('mock_interviews')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching mock interviews:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// Skill Assessment Management
export async function saveSkillAssessment(assessmentData: Partial<SkillAssessment>): Promise<SkillAssessment | null> {
  const { data, error } = await supabase
    .from('skill_assessments')
    .insert(assessmentData)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error saving skill assessment:', error);
    return null;
  }
  return data;
}

export async function updateSkillAssessment(id: string, updates: Partial<SkillAssessment>): Promise<SkillAssessment | null> {
  const { data, error } = await supabase
    .from('skill_assessments')
    .update(updates)
    .eq('id', id)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error updating skill assessment:', error);
    return null;
  }
  return data;
}

export async function getSkillAssessmentsBySession(sessionId: string): Promise<SkillAssessment[]> {
  const { data, error } = await supabase
    .from('skill_assessments')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching skill assessments:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// Job Match Management
export async function saveJobMatches(jobMatches: Partial<JobMatch>[]): Promise<JobMatch[]> {
  const { data, error } = await supabase
    .from('job_matches')
    .insert(jobMatches)
    .select();

  if (error) {
    console.error('Error saving job matches:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

export async function getJobMatchesBySession(sessionId: string, limit = 20): Promise<JobMatch[]> {
  const { data, error } = await supabase
    .from('job_matches')
    .select('*')
    .eq('session_id', sessionId)
    .order('compatibility_score', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching job matches:', error);
    return [];
  }
  return Array.isArray(data) ? data : [];
}

// AI Service Integration
export async function callAIService<T = unknown>(request: AIRequest): Promise<AIResponse<T>> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-career-assistant', {
      body: request,
    });

    if (error) {
      const errorMsg = await error?.context?.text?.();
      console.error('AI service error:', errorMsg || error?.message);
      return {
        success: false,
        error: errorMsg || error?.message || 'AI service error',
      };
    }

    return data as AIResponse<T>;
  } catch (error) {
    console.error('Error calling AI service:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
