ALTER TABLE "envelopes" ADD COLUMN "codigo_publico" text;
ALTER TABLE "envelopes" ADD CONSTRAINT "envelopes_codigo_publico_unique" UNIQUE("codigo_publico");

CREATE OR REPLACE FUNCTION ler_envelope_publico(codigo_buscado text)
RETURNS jsonb AS $$
DECLARE
  resultado jsonb;
BEGIN
  SELECT jsonb_build_object(
    'estado', e.estado,
    'hash_original', d.hash,
    'hash_final', d.hash,
    'signatarios', (
      SELECT jsonb_agg(jsonb_build_object(
        'nome', s.nome,
        'estado', s.estado,
        'data', s.atualizado_em
      ))
      FROM signatarios_envelope s WHERE s.envelope_id = e.id
    )
  ) INTO resultado
  FROM envelopes e
  LEFT JOIN documentos_envelope d ON d.envelope_id = e.id
  WHERE e.codigo_publico = codigo_buscado
  LIMIT 1;

  RETURN resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
