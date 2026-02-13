import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, TrendingUp, ExternalLink } from 'lucide-react';
import type { JobMatch } from '@/types';

interface JobCardProps {
  job: JobMatch;
}

export function JobCard({ job }: JobCardProps) {
  const scoreColor = (score: number) => {
    if (score >= 80) return 'bg-primary text-primary-foreground';
    if (score >= 60) return 'bg-secondary text-secondary-foreground';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <Card className="organic-shadow transition-smooth hover:organic-shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-xl">{job.job_title}</CardTitle>
            {job.company && (
              <p className="text-sm text-muted-foreground">{job.company}</p>
            )}
          </div>
          {job.compatibility_score && (
            <Badge className={scoreColor(job.compatibility_score)}>
              {job.compatibility_score}% Match
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
          {job.location && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
          )}
          {job.match_details?.experience && (
            <div className="flex items-center gap-1">
              <Briefcase className="h-4 w-4" />
              <span>{job.match_details.experience}</span>
            </div>
          )}
          {job.match_details?.salary && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{job.match_details.salary}</span>
            </div>
          )}
        </div>

        {job.description && (
          <p className="text-sm text-foreground line-clamp-3">{job.description}</p>
        )}

        {job.match_details?.matchReason && (
          <div className="rounded-lg bg-accent p-3">
            <p className="text-sm text-accent-foreground">
              <span className="font-semibold">Why this matches: </span>
              {job.match_details.matchReason}
            </p>
          </div>
        )}

        {job.requirements && job.requirements.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {job.requirements.slice(0, 5).map((req, idx) => (
              <Badge key={idx} variant="outline">
                {req}
              </Badge>
            ))}
          </div>
        )}

        {job.match_details?.applyUrl && (
          <Button className="w-full" asChild>
            <a href={job.match_details.applyUrl} target="_blank" rel="noopener noreferrer">
              Apply Now
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
