import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { SkillGapDetail } from '@/types';

interface SkillCardProps {
  skill: SkillGapDetail;
}

export function SkillCard({ skill }: SkillCardProps) {
  const importanceColors = {
    High: 'bg-destructive text-destructive-foreground',
    Medium: 'bg-secondary text-secondary-foreground',
    Low: 'bg-muted text-muted-foreground',
  };

  const levelProgress = {
    None: 0,
    Beginner: 25,
    Intermediate: 50,
    Advanced: 75,
    Expert: 100,
  };

  const currentProgress = levelProgress[skill.currentLevel] || 0;
  const targetProgress = levelProgress[skill.targetLevel] || 100;

  return (
    <Card className="organic-shadow transition-smooth hover:organic-shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">{skill.skill}</h3>
          <Badge className={importanceColors[skill.importance]}>
            {skill.importance}
          </Badge>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Current Level</span>
              <span className="font-medium text-foreground">{skill.currentLevel}</span>
            </div>
            <Progress value={currentProgress} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Target Level</span>
              <span className="font-medium text-primary">{skill.targetLevel}</span>
            </div>
            <Progress value={targetProgress} className="h-2" />
          </div>

          <div className="pt-2 border-t border-border">
            <span className="text-xs text-muted-foreground">Priority: </span>
            <span className="text-xs font-semibold text-primary">#{skill.priority}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
