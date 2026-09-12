CREATE OR REPLACE FUNCTION buscar_usuario_sistema(p_email text)
RETURNS TABLE (
  id uuid,
  empresa_id uuid,
  email text,
  senha_hash text,
  papel text,
  falhas_login integer,
  bloqueado_ate timestamp with time zone
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT u.id, u.empresa_id, u.email, u.senha_hash, u.papel, u.falhas_login, u.bloqueado_ate
  FROM "usuario" u
  WHERE LOWER(u.email) = LOWER(p_email);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION buscar_sessao_sistema(p_hash bytea)
RETURNS TABLE (
  id uuid,
  empresa_id uuid,
  usuario_id uuid,
  expira_em timestamp with time zone,
  revogada_em timestamp with time zone
)
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT s.id, s.empresa_id, s.usuario_id, s.expira_em, s.revogada_em
  FROM "sessao" s
  WHERE s.token_hash = p_hash;
END;
$$ LANGUAGE plpgsql;
