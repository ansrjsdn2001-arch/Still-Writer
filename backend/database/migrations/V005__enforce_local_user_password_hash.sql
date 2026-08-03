BEGIN;

CREATE OR REPLACE FUNCTION enforce_local_user_password_hash()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.provider = 'LOCAL'
       AND NOT EXISTS (
           SELECT 1
           FROM users
           WHERE id = NEW.user_id
             AND password_hash IS NOT NULL
             AND btrim(password_hash) <> ''
       ) THEN
        RAISE EXCEPTION 'LOCAL identity requires users.password_hash';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_auth_identities_local_password_hash ON auth_identities;

CREATE TRIGGER trg_auth_identities_local_password_hash
BEFORE INSERT OR UPDATE OF provider, user_id
ON auth_identities
FOR EACH ROW
EXECUTE FUNCTION enforce_local_user_password_hash();

CREATE OR REPLACE FUNCTION prevent_local_user_password_hash_removal()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.password_hash IS NULL
       AND EXISTS (
           SELECT 1
           FROM auth_identities
           WHERE user_id = NEW.id
             AND provider = 'LOCAL'
       ) THEN
        RAISE EXCEPTION 'LOCAL user password_hash cannot be null';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_prevent_local_password_hash_removal ON users;

CREATE TRIGGER trg_users_prevent_local_password_hash_removal
BEFORE UPDATE OF password_hash
ON users
FOR EACH ROW
EXECUTE FUNCTION prevent_local_user_password_hash_removal();

COMMIT;
