export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2 ** 32
    return this.seed / 2 ** 32
  }

  nextRange(min: number, max: number): number {
    return min + (max - min) * this.next()
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1))
  }
} 