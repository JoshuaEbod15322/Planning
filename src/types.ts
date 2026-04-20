export interface Assignment {
  id: string;
  item: string;
  person: string;
}

export interface Fee {
  id: string;
  detail: string;
  amount: number;
}

export type Theme = "modern" | "classic" | "brutalist" | "luxury" | "technical";

export interface EventData {
  title: string;
  when: string;
  time?: string;
  where: string;
  notes?: string;
  theme: Theme;
  assignments: Assignment[];
  fees: Fee[];
}
