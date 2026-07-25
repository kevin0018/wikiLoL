export const QUEUE_TYPES = [
  "RANKED_SOLO_5x5",
  "RANKED_FLEX_SR",
] as const;

export type QueueCode = (typeof QUEUE_TYPES)[number];

export class QueueType {
  private constructor(public readonly value: QueueCode) {}

  static from(value: string): QueueType {
    if (!QUEUE_TYPES.includes(value as QueueCode)) {
      throw new Error(`Cola no válida: ${value}`);
    }
    return new QueueType(value as QueueCode);
  }

  equals(other: QueueType): boolean {
    return this.value === other.value;
  }
}
