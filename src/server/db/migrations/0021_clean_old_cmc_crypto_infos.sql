-- Custom SQL migration file, put your code below! --
CREATE
OR REPLACE FUNCTION cleanup_old_cmc_crypto_infos () RETURNS trigger AS $$
BEGIN
  DELETE FROM cache.cmc_crypto_infos 
    WHERE created_at < NOW() - INTERVAL '24 hours';
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER cleanup_old_cmc_crypto_infos_trigger
AFTER INSERT ON cache.cmc_crypto_infos FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_cmc_crypto_infos ();
