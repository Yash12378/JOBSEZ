import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Clock, Award, BookOpen } from 'lucide-react';
import type { LearningRecommendation } from '@/types';

interface LearningPathCardProps {
  recommendation: LearningRecommendation;
}

export function LearningPathCard({ recommendation }: LearningPathCardProps) {
  const priorityColors = {
    1: 'bg-destructive text-destructive-foreground',
    2: 'bg-secondary text-secondary-foreground',
    3: 'bg-muted text-muted-foreground',
  };

  return (
    <Card className="organic-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{recommendation.skill}</CardTitle>
          <Badge className={priorityColors[recommendation.priority as keyof typeof priorityColors] || 'bg-muted'}>
            Priority {recommendation.priority}
          </Badge>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>{recommendation.estimatedTime}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="courses">
            <AccordionTrigger className="text-sm font-semibold">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Recommended Courses ({recommendation.courses?.length || 0})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {recommendation.courses?.map((course, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-foreground">{course.title}</h4>
                      <Badge variant="outline">{course.level}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{course.provider}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{course.duration}</span>
                    </div>
                    {course.topics && course.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.topics.map((topic, topicIdx) => (
                          <Badge key={topicIdx} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {recommendation.certifications && recommendation.certifications.length > 0 && (
            <AccordionItem value="certifications">
              <AccordionTrigger className="text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Certifications ({recommendation.certifications.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {recommendation.certifications.map((cert, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Award className="h-4 w-4 text-primary mt-0.5" />
                      <span>{cert}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}

          {recommendation.resources && recommendation.resources.length > 0 && (
            <AccordionItem value="resources">
              <AccordionTrigger className="text-sm font-semibold">
                Free Resources ({recommendation.resources.length})
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2">
                  {recommendation.resources.map((resource, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground">
                      • {resource}
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
