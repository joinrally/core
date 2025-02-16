export function getScoreColor(score: number): string {
  if (score >= 90) return "bg-green-500"
  if (score >= 70) return "bg-green-400"
  if (score >= 50) return "bg-yellow-400"
  if (score >= 30) return "bg-orange-400"
  return "bg-red-500"
}

