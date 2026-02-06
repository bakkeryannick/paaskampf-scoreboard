-- Events feature migration

-- 1. Events table
CREATE TABLE events (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  weekend_id uuid REFERENCES weekend(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_active boolean DEFAULT false,
  counts_for_total boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON events FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- 2. Event scores table
CREATE TABLE event_scores (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id uuid REFERENCES events(id) ON DELETE CASCADE,
  player_id uuid REFERENCES players(id) ON DELETE CASCADE,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  score integer DEFAULT 0,
  UNIQUE(event_id, player_id)
);
ALTER TABLE event_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public access" ON event_scores FOR ALL USING (true) WITH CHECK (true);
ALTER PUBLICATION supabase_realtime ADD TABLE event_scores;

-- 3. Add event_id to teams
ALTER TABLE teams ADD COLUMN event_id uuid REFERENCES events(id) ON DELETE CASCADE;

-- 4. RPC: score_in_event
CREATE OR REPLACE FUNCTION score_in_event(p_event_id uuid, p_player_ids uuid[], p_points integer, p_counts_for_total boolean DEFAULT true)
RETURNS void AS $$
BEGIN
  IF p_counts_for_total THEN
    UPDATE players SET score = score + p_points WHERE id = ANY(p_player_ids);
  END IF;
  UPDATE event_scores SET score = score + p_points
    WHERE event_id = p_event_id AND player_id = ANY(p_player_ids);
END;
$$ LANGUAGE plpgsql;
