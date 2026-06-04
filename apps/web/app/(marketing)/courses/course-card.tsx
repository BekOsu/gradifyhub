import Image from "next/image";

interface CourseCardProps {
  title: string;
  description: string;
  provider: string;
  imageUrl: string | null;
  courseUrl: string;
  level: string;
  category: string;
  durationHours: number | null;
  studentCount: number | null;
  rating: number | null;
  isFree: boolean;
}

const PROVIDER_COLORS: Record<string, string> = {
  "Harvard": "bg-gradient-to-br from-red-600 to-red-800",
  "edX": "bg-gradient-to-br from-blue-600 to-blue-800",
  "freeCodeCamp": "bg-gradient-to-br from-emerald-600 to-emerald-800",
  "DeepLearning.AI": "bg-gradient-to-br from-orange-600 to-orange-800",
  "Google": "bg-gradient-to-br from-blue-500 to-purple-600",
  "Coursera": "bg-gradient-to-br from-blue-700 to-blue-900",
  "MIT": "bg-gradient-to-br from-gray-800 to-gray-900",
  "Stanford": "bg-gradient-to-br from-red-700 to-red-900",
  "Fast.ai": "bg-gradient-to-br from-indigo-600 to-indigo-800",
  "Kaggle": "bg-gradient-to-br from-cyan-600 to-cyan-800",
  "AWS": "bg-gradient-to-br from-orange-500 to-orange-700",
  "The Odin Project": "bg-gradient-to-br from-yellow-600 to-yellow-800",
  "roadmap.sh": "bg-gradient-to-br from-slate-600 to-slate-800",
};

function getProviderColor(provider: string): string {
  for (const [key, color] of Object.entries(PROVIDER_COLORS)) {
    if (provider.toLowerCase().includes(key.toLowerCase())) {
      return color;
    }
  }
  return "bg-gradient-to-br from-slate-500 to-slate-700";
}

function getProviderInitial(provider: string): string {
  return provider.charAt(0).toUpperCase();
}

export function CourseCard({
  title,
  description,
  provider,
  imageUrl,
  courseUrl,
  level,
  durationHours,
  studentCount,
  rating,
  isFree,
}: CourseCardProps) {
  const formatStudents = (count: number) => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`;
    return count.toString();
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

    return (
      <>
        {"★".repeat(fullStars)}
        {hasHalf && "½"}
        {"☆".repeat(emptyStars)}
      </>
    );
  };

  return (
    <a
      href={courseUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex h-full flex-col rounded-lg border border-gray-200 bg-white transition-all hover:shadow-lg"
    >
      {/* Thumbnail / Gradient */}
      <div className={`relative h-40 overflow-hidden rounded-t-lg ${imageUrl ? "" : getProviderColor(provider)}`}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={provider}
            fill
            className="object-cover"
          />
        ) : null}

        {/* Provider badge (overlay) */}
        <div className="absolute left-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-xs font-bold text-gray-900">
          {getProviderInitial(provider)}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        {/* Title + Description */}
        <div>
          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-xs text-gray-600">
            {description}
          </p>
        </div>

        {/* Rating + Student count */}
        {(rating !== null || studentCount !== null) && (
          <div className="mt-3 border-t border-gray-100 pt-3">
            <p className="text-xs text-gray-600">
              {rating !== null && (
                <>
                  <span className="text-yellow-500">{renderStars(rating)}</span>
                  {" "}
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </>
              )}
              {rating !== null && studentCount !== null && " • "}
              {studentCount !== null && (
                <span>{formatStudents(studentCount)} students</span>
              )}
            </p>
          </div>
        )}

        {/* Tags: Level, Duration, Free */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span
            className={`inline-block rounded-full px-2 py-1 text-xs font-semibold text-white ${
              level === "beginner"
                ? "bg-green-600"
                : level === "intermediate"
                  ? "bg-amber-600"
                  : "bg-red-600"
            }`}
          >
            {level}
          </span>

          {durationHours ? (
            <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
              {durationHours} hrs
            </span>
          ) : (
            <span className="inline-block rounded-full bg-gray-200 px-2 py-1 text-xs font-semibold text-gray-700">
              Self-paced
            </span>
          )}

          {isFree && (
            <span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
              FREE
            </span>
          )}
        </div>

        {/* CTA Button */}
        <button className="mt-4 w-full rounded-lg bg-foreground py-2 text-sm font-semibold text-background transition-opacity hover:opacity-90 group-hover:opacity-100">
          Start Learning →
        </button>
      </div>
    </a>
  );
}
