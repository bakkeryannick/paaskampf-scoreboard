export interface Weekend {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface Player {
  id: string;
  weekend_id: string;
  name: string;
  score: number;
  color: string;
  team_id: string | null;
  sort_order: number;
  created_at: string;
}

export interface Team {
  id: string;
  weekend_id: string;
  event_id: string | null;
  name: string;
  score: number;
  color: string;
  sort_order: number;
  created_at: string;
}

export interface Event {
  id: string;
  weekend_id: string;
  name: string;
  is_active: boolean;
  counts_for_total: boolean;
  sort_order: number;
  created_at: string;
}

export interface EventScore {
  id: string;
  event_id: string;
  player_id: string;
  team_id: string | null;
  score: number;
}