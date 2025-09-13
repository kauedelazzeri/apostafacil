-- Add deleted_at field to apostas table
-- Execute this in your Supabase SQL editor

-- Add deleted_at column
ALTER TABLE apostas 
ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Create index for better performance when filtering deleted bets
CREATE INDEX idx_apostas_deleted_at ON apostas(deleted_at);

-- RPC function to soft delete a bet
CREATE OR REPLACE FUNCTION delete_bet(
  bet_id UUID,
  user_email TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  bet_record RECORD;
  updated_bet JSONB;
BEGIN
  -- Check if the bet exists and user is the creator
  SELECT * INTO bet_record
  FROM apostas
  WHERE id = bet_id AND email_criador = user_email AND deleted_at IS NULL;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aposta não encontrada ou usuário sem permissão';
  END IF;
  
  -- Check if bet has votes (optional protection)
  -- Uncomment if you want to prevent deletion of bets with votes
  -- IF EXISTS (SELECT 1 FROM apostas_feitas WHERE aposta_id = bet_id) THEN
  --   RAISE EXCEPTION 'Não é possível deletar apostas que já possuem votos';
  -- END IF;
  
  -- Soft delete the bet
  UPDATE apostas
  SET deleted_at = NOW()
  WHERE id = bet_id AND email_criador = user_email;
  
  -- Return the updated bet
  SELECT to_jsonb(apostas.*) INTO updated_bet
  FROM apostas
  WHERE id = bet_id;
  
  RETURN updated_bet;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION delete_bet(UUID, TEXT) TO authenticated;