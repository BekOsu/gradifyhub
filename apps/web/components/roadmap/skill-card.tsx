import Link from "next/link";

type Skill = {
  id: string;
  name: string;
  estimatedHours: number;
  status: string;
  marketBadge: string | null;
};

export function SkillCard({ skill }: { skill: Skill }) {
  const locked = skill.status === "locked";

  if (locked) {
    return (
      <div className="flex flex-col gap-2 rounded-lg border border-input bg-muted/20 p-4 opacity-60">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{skill.name}</span>
          <span className="text-xs text-muted-foreground">🔒</span>
        </div>
        <span className="text-xs text-muted-foreground">{skill.estimatedHours}h</span>
      </div>
    );
  }

  return (
    <Link
      href={`/roadmap/skill/${skill.id}`}
      className="flex flex-col gap-2 rounded-lg border border-input bg-background p-4 transition-colors hover:bg-muted/50"
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{skill.name}</span>
        {skill.status === "completed" && (
          <span className="text-xs text-green-500">✓</span>
        )}
        {skill.status === "in-progress" && (
          <span className="h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
      <span className="text-xs text-muted-foreground">{skill.estimatedHours}h</span>
      {skill.marketBadge && (
        <span className="text-xs text-green-600">{skill.marketBadge}</span>
      )}
    </Link>
  );
}
