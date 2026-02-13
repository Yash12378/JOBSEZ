import { createClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AIRequest {
  action: 'parse_resume' | 'analyze_skills' | 'generate_learning_path' | 'career_guidance' | 'mock_interview' | 'evaluate_answer' | 'skill_assessment' | 'match_jobs';
  data: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, data }: AIRequest = await req.json();
    const apiKey = Deno.env.get('INTEGRATIONS_API_KEY');

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    let prompt = '';
    
    switch (action) {
      case 'parse_resume':
        prompt = `You are an expert resume parser. Analyze the following resume text and extract structured information in JSON format.

Resume Text:
${data.resumeText}

Extract and return ONLY a valid JSON object with this exact structure (no markdown, no code blocks):
{
  "personalInfo": {
    "name": "Full Name",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "city, country"
  },
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "description": "Job description and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "Institution Name",
      "year": "Graduation Year"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"]
}`;
        break;

      case 'analyze_skills':
        prompt = `You are a career advisor analyzing skill gaps. Based on the user's current skills and target role, identify skill gaps and market demand.

Current Skills: ${JSON.stringify(data.currentSkills)}
Target Role: ${data.targetRole}

Provide a detailed analysis in JSON format (no markdown, no code blocks):
{
  "skillGaps": [
    {
      "skill": "Skill Name",
      "importance": "High/Medium/Low",
      "currentLevel": "Beginner/Intermediate/Advanced/None",
      "targetLevel": "Intermediate/Advanced/Expert",
      "priority": 1
    }
  ],
  "marketDemand": {
    "trending": ["trending skill1", "trending skill2"],
    "essential": ["essential skill1", "essential skill2"],
    "nice_to_have": ["optional skill1", "optional skill2"]
  },
  "recommendations": "Overall recommendations for skill development"
}`;
        break;

      case 'generate_learning_path':
        prompt = `You are a learning path designer. Create a personalized learning roadmap based on identified skill gaps.

Skill Gaps: ${JSON.stringify(data.skillGaps)}
Target Role: ${data.targetRole}

Generate a comprehensive learning path in JSON format (no markdown, no code blocks):
{
  "learningPath": [
    {
      "skill": "Skill Name",
      "priority": 1,
      "courses": [
        {
          "title": "Course Title",
          "provider": "Platform Name",
          "duration": "X weeks/months",
          "level": "Beginner/Intermediate/Advanced",
          "topics": ["topic1", "topic2"]
        }
      ],
      "certifications": ["Certification Name"],
      "estimatedTime": "X months",
      "resources": ["Free resource 1", "Free resource 2"]
    }
  ],
  "totalDuration": "X months",
  "milestones": [
    {
      "month": 1,
      "goals": ["goal1", "goal2"]
    }
  ]
}`;
        break;

      case 'career_guidance':
        prompt = `You are a career counselor providing personalized career guidance.

User Profile: ${JSON.stringify(data.profile)}
Current Skills: ${JSON.stringify(data.skills)}

Provide career recommendations in JSON format (no markdown, no code blocks):
{
  "recommendedCareers": [
    {
      "title": "Career Title",
      "matchScore": 85,
      "description": "Career description",
      "requiredSkills": ["skill1", "skill2"],
      "growthPotential": "High/Medium/Low",
      "averageSalary": "Salary range in INR",
      "demandTrend": "Growing/Stable/Declining",
      "whyGoodFit": "Explanation of why this career suits the user"
    }
  ],
  "careerPathways": [
    {
      "from": "Current Role",
      "to": "Target Role",
      "steps": ["step1", "step2"],
      "timeline": "X years"
    }
  ]
}`;
        break;

      case 'mock_interview':
        prompt = `You are an expert interviewer. Generate realistic interview questions for the specified role.

Job Role: ${data.jobRole}
Experience Level: ${data.experienceLevel || 'Mid-level'}
Number of Questions: ${data.questionCount || 5}

Generate interview questions in JSON format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "Interview question text",
      "type": "Technical/Behavioral/Situational",
      "difficulty": "Easy/Medium/Hard",
      "expectedPoints": ["point1", "point2", "point3"]
    }
  ],
  "tips": ["tip1", "tip2"]
}`;
        break;

      case 'evaluate_answer':
        prompt = `You are an interview evaluator. Assess the candidate's answer to the interview question.

Question: ${data.question}
Expected Points: ${JSON.stringify(data.expectedPoints)}
Candidate's Answer: ${data.answer}

Provide detailed feedback in JSON format (no markdown, no code blocks):
{
  "score": 75,
  "strengths": ["strength1", "strength2"],
  "improvements": ["area1", "area2"],
  "feedback": "Detailed feedback on the answer",
  "suggestedAnswer": "Example of a strong answer"
}`;
        break;

      case 'skill_assessment':
        prompt = `You are a skill assessment creator. Generate assessment questions for the specified skill category.

Skill Category: ${data.skillCategory}
Difficulty Level: ${data.difficulty || 'Mixed'}
Number of Questions: ${data.questionCount || 10}

Generate assessment questions in JSON format (no markdown, no code blocks):
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "type": "MCQ/True-False/Short-Answer",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": "correct option or answer",
      "explanation": "Explanation of the correct answer",
      "difficulty": "Easy/Medium/Hard"
    }
  ]
}`;
        break;

      case 'match_jobs':
        prompt = `You are a job matching expert. Generate relevant job opportunities based on the user's profile.

User Skills: ${JSON.stringify(data.skills)}
Experience: ${data.experience}
Location Preference: ${data.location || 'India'}
Target Roles: ${JSON.stringify(data.targetRoles || [])}

Generate job matches in JSON format (no markdown, no code blocks):
{
  "jobs": [
    {
      "title": "Job Title",
      "company": "Company Name (realistic Indian companies)",
      "location": "City, India",
      "type": "Full-time/Part-time/Contract",
      "experience": "X-Y years",
      "salary": "Salary range in INR",
      "description": "Job description",
      "requirements": ["requirement1", "requirement2"],
      "compatibilityScore": 85,
      "matchReason": "Why this job matches the user's profile",
      "applyUrl": "https://careers.company.com/job-id"
    }
  ]
}`;
        break;

      default:
        throw new Error('Invalid action type');
    }

    // Call Gemini API
    const response = await fetch(
      'https://app-9lzawza7xw5d-api-VaOwP8E7dJqa.gateway.appmedo.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gateway-Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error: ${errorText}`);
    }

    // Parse SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let fullText = '';

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const jsonData = JSON.parse(line.slice(6));
              if (jsonData.candidates?.[0]?.content?.parts?.[0]?.text) {
                fullText += jsonData.candidates[0].content.parts[0].text;
              }
            } catch (e) {
              // Skip invalid JSON lines
            }
          }
        }
      }
    }

    // Clean and parse the response
    let cleanedText = fullText.trim();
    // Remove markdown code blocks if present
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    let result;
    try {
      result = JSON.parse(cleanedText);
    } catch (e) {
      // If parsing fails, return the raw text
      result = { rawResponse: cleanedText, error: 'Failed to parse JSON response' };
    }

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ai-career-assistant:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
