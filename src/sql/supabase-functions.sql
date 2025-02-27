
-- Function to get channel distribution
CREATE OR REPLACE FUNCTION get_channel_distribution()
RETURNS TABLE (
  channel text,
  count bigint
) 
LANGUAGE SQL
AS $$
  SELECT channel, COUNT(*) as count
  FROM messages
  GROUP BY channel
  ORDER BY count DESC;
$$;

-- Function to get category distribution
CREATE OR REPLACE FUNCTION get_category_distribution()
RETURNS TABLE (
  category text,
  count bigint
) 
LANGUAGE SQL
AS $$
  SELECT category, COUNT(*) as count
  FROM messages
  WHERE category IS NOT NULL
  GROUP BY category
  ORDER BY count DESC;
$$;
