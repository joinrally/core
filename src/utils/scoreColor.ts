export function getScoreColor(score: number): string {
  if (score >= 85) return "bg-green-500 text-white"
  if (score >= 60) return "bg-yellow-500 text-white"
  return "bg-red-500 text-white"
}

