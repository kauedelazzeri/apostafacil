-- RPC function to finalize a bet
-- Execute this in your Supabase SQL editor

CREATE OR REPLACE FUNCTION finalize_bet(
  bet_id UUID,
  final_result TEXT,
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
  WHERE id = bet_id AND email_criador = user_email;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Aposta não encontrada ou usuário sem permissão';
  END IF;
  
  -- Check if already finalized
  IF bet_record.resultado_final IS NOT NULL THEN
    RAISE EXCEPTION 'Aposta já foi finalizada';
  END IF;
  
  -- Update the bet
  UPDATE apostas
  SET resultado_final = final_result
  WHERE id = bet_id AND email_criador = user_email;
  
  -- Return the updated bet
  SELECT to_jsonb(apostas.*) INTO updated_bet
  FROM apostas
  WHERE id = bet_id;
  
  RETURN updated_bet;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION finalize_bet(UUID, TEXT, TEXT) TO authenticated;