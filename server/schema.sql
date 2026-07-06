--
-- PostgreSQL database dump
--

\restrict VXiz7YCfW4yBAhlpnCD5OiBkLGXmdADH2z6FOoMQkoYAQcd704ftExpGdwY7GrR

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.18 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: _heroku; Type: SCHEMA; Schema: -; Owner: heroku_admin
--

CREATE SCHEMA _heroku;


ALTER SCHEMA _heroku OWNER TO heroku_admin;

--
-- Name: heroku_ext; Type: SCHEMA; Schema: -; Owner: uepr701d9mvmuv
--

CREATE SCHEMA heroku_ext;


ALTER SCHEMA heroku_ext OWNER TO uepr701d9mvmuv;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: uepr701d9mvmuv
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO uepr701d9mvmuv;

--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: create_ext(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.create_ext() RETURNS event_trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

DECLARE

  schemaname pg_catalog.TEXT;
  databaseowner pg_catalog.TEXT;

  r pg_catalog.RECORD;

BEGIN
  IF tg_tag OPERATOR(pg_catalog.=) 'CREATE EXTENSION'
       OR tg_tag OPERATOR(pg_catalog.=) 'ALTER EXTENSION' THEN
    PERFORM _heroku.validate_search_path();

    FOR r IN SELECT * FROM pg_catalog.pg_event_trigger_ddl_commands()
    LOOP
        CONTINUE WHEN (r.command_tag OPERATOR(pg_catalog.!=) 'CREATE EXTENSION'
                         AND r.command_tag OPERATOR(pg_catalog.!=) 'ALTER EXTENSION')
                      OR r.object_type OPERATOR(pg_catalog.!=) 'extension';

        schemaname := (
            SELECT n.nspname
            FROM pg_catalog.pg_extension AS e
            INNER JOIN pg_catalog.pg_namespace AS n
            ON e.extnamespace OPERATOR(pg_catalog.=) n.oid
            WHERE e.oid OPERATOR(pg_catalog.=) r.objid
        );

        databaseowner := (
            SELECT pg_catalog.pg_get_userbyid(d.datdba)
            FROM pg_catalog.pg_database d
            WHERE d.datname OPERATOR(pg_catalog.=) pg_catalog.current_database()
        );
        --RAISE NOTICE 'Record for event trigger %, objid: %,tag: %, current_user: %, schema: %, database_owenr: %', r.object_identity, r.objid, tg_tag, current_user, schemaname, databaseowner;
        -- Though not ideal, we do not fully quality operators; we should be protected by validate_search_path
        IF r.object_identity OPERATOR(pg_catalog.=) 'address_standardizer_data_us' THEN
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_gaz');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_lex');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'us_rules');
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'amcheck' THEN
            -- Grant execute permissions on amcheck functions (bt_*, gin_*, and verify_*)
            PERFORM _heroku.grant_function_execute_for_extension(r.objid, schemaname, databaseowner, ARRAY['bt_%', 'gin_%', 'verify_%'], NULL);
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'dblink' THEN
            -- Grant execute permissions on dblink functions, excluding dblink_connect_u()
            -- which allows unauthenticated connections and should remain superuser-only
            PERFORM _heroku.grant_function_execute_for_extension(r.objid, schemaname, databaseowner, ARRAY['dblink%'], 'dblink_connect_u%');
            -- Explicitly revoke permissions on dblink_connect_u functions as a safety measure
            -- in case they were granted by default or in a previous version
            BEGIN
                EXECUTE pg_catalog.format('REVOKE EXECUTE ON FUNCTION %I.dblink_connect_u(text) FROM %I;', schemaname, databaseowner);
            EXCEPTION WHEN OTHERS THEN
                -- Function might not exist, continue
                NULL;
            END;
            BEGIN
                EXECUTE pg_catalog.format('REVOKE EXECUTE ON FUNCTION %I.dblink_connect_u(text, text) FROM %I;', schemaname, databaseowner);
            EXCEPTION WHEN OTHERS THEN
                -- Function might not exist, continue
                NULL;
            END;
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'dict_int' THEN
            EXECUTE pg_catalog.format('ALTER TEXT SEARCH DICTIONARY %I.intdict OWNER TO %I;', schemaname, databaseowner);
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'pg_prewarm' THEN
            -- Grant execute permissions on pg_prewarm and autoprewarm functions
            PERFORM _heroku.grant_function_execute_for_extension(
                r.objid, schemaname, databaseowner, ARRAY['pg_prewarm%', 'autoprewarm%'], NULL
            );
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'pg_partman' THEN
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'part_config');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'part_config_sub');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT, UPDATE, INSERT, DELETE', databaseowner, 'custom_time_partitions');
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'pg_stat_statements' THEN
            PERFORM _heroku.grant_function_execute_for_extension(
                r.objid, schemaname, databaseowner, ARRAY['pg_stat_statements%'], 'pg_stat_statements_reset%'
            );
            EXECUTE pg_catalog.format(
                'GRANT EXECUTE ON FUNCTION %I.pg_stat_statements_reset TO %I',
                schemaname, pg_catalog.current_user()
            );
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'postgres_fdw' THEN
            -- Grant USAGE on the foreign data wrapper (required for creating foreign servers and user mappings)
            EXECUTE pg_catalog.format('GRANT USAGE ON FOREIGN DATA WRAPPER postgres_fdw TO %I;', databaseowner);
            -- Grant execute permissions on all postgres_fdw functions
            PERFORM _heroku.grant_function_execute_for_extension(r.objid, schemaname, databaseowner, ARRAY['postgres_fdw%'], NULL);
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'postgis' THEN
            PERFORM _heroku.postgis_after_create();
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'postgis_raster' THEN
            PERFORM _heroku.postgis_after_create();
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT', databaseowner, 'raster_columns');
            PERFORM _heroku.grant_table_if_exists(schemaname, 'SELECT', databaseowner, 'raster_overviews');
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'postgis_topology' THEN
            PERFORM _heroku.postgis_after_create();
            EXECUTE pg_catalog.format('ALTER SCHEMA topology OWNER TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT USAGE ON SCHEMA topology TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA topology TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('topology', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);
            EXECUTE pg_catalog.format('GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA topology TO %I;', databaseowner);
        ELSIF r.object_identity OPERATOR(pg_catalog.=) 'postgis_tiger_geocoder' THEN
            PERFORM _heroku.postgis_after_create();
            EXECUTE pg_catalog.format('ALTER SCHEMA tiger OWNER TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT USAGE ON SCHEMA tiger TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tiger TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('tiger', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);
            EXECUTE pg_catalog.format('ALTER SCHEMA tiger_data OWNER TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT USAGE ON SCHEMA tiger_data TO %I;', databaseowner);
            EXECUTE pg_catalog.format('GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA tiger_data TO %I;', databaseowner);
            PERFORM _heroku.grant_table_if_exists('tiger_data', 'SELECT, UPDATE, INSERT, DELETE', databaseowner);
        END IF;
    END LOOP;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.create_ext() OWNER TO heroku_admin;

--
-- Name: drop_ext(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.drop_ext() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

DECLARE

  schemaname pg_catalog.TEXT;
  databaseowner pg_catalog.TEXT;

  r pg_catalog.RECORD;

BEGIN
  IF tg_tag OPERATOR(pg_catalog.=) 'DROP EXTENSION' THEN
    PERFORM _heroku.validate_search_path();

    FOR r IN SELECT * FROM pg_catalog.pg_event_trigger_dropped_objects()
    LOOP
      CONTINUE WHEN r.object_type OPERATOR(pg_catalog.!=) 'extension';

      databaseowner := (
            SELECT pg_catalog.pg_get_userbyid(d.datdba)
            FROM pg_catalog.pg_database d
            WHERE d.datname OPERATOR(pg_catalog.=) pg_catalog.current_database()
      );

      --RAISE NOTICE 'Record for event trigger %, objid: %,tag: %, current_user: %, database_owner: %, schemaname: %', r.object_identity, r.objid, tg_tag, current_user, databaseowner, r.schema_name;

      IF r.object_identity OPERATOR(pg_catalog.=) 'postgis_topology' THEN
          EXECUTE pg_catalog.format('DROP SCHEMA IF EXISTS topology');
      END IF;
    END LOOP;

  END IF;
END;
$$;


ALTER FUNCTION _heroku.drop_ext() OWNER TO heroku_admin;

--
-- Name: extension_before_drop(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.extension_before_drop() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

DECLARE

  query pg_catalog.TEXT;

BEGIN
  -- skip this validation if executed by an rds_superuser
  IF tg_tag OPERATOR(pg_catalog.=) 'DROP EXTENSION' AND NOT pg_catalog.pg_has_role(session_user, 'rds_superuser', 'MEMBER') THEN
    PERFORM _heroku.validate_search_path();

    query := pg_catalog.unistr(pg_catalog.lower(pg_catalog.current_query()));
    IF query OPERATOR(pg_catalog.~) '\mplpgsql\M' THEN
      RAISE EXCEPTION 'The plpgsql extension is required for database management and cannot be dropped.';
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.extension_before_drop() OWNER TO heroku_admin;

--
-- Name: extension_before_run(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.extension_before_run() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF tg_tag OPERATOR(pg_catalog.=) 'CREATE EXTENSION'
       OR tg_tag OPERATOR(pg_catalog.=) 'ALTER EXTENSION'
       OR tg_tag OPERATOR(pg_catalog.=) 'DROP EXTENSION' THEN
    PERFORM _heroku.validate_search_path();
    PERFORM _heroku.validate_pg_temp_clean();
    PERFORM _heroku.validate_extension_query();
  END IF;
END;
$$;


ALTER FUNCTION _heroku.extension_before_run() OWNER TO heroku_admin;

--
-- Name: grant_function_execute_for_extension(oid, text, text, text[], text); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.grant_function_execute_for_extension(extension_oid oid, schemaname text, databaseowner text, name_patterns text[] DEFAULT NULL::text[], exclude_pattern text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

DECLARE
    func_rec pg_catalog.RECORD;

BEGIN
    PERFORM _heroku.validate_search_path();

    -- Dynamically grant execute permissions on extension functions.
    -- Finds functions belonging to the extension via pg_depend and grants execute permissions.
    FOR func_rec IN
        SELECT p.oid::regprocedure::text as func_sig
        FROM pg_catalog.pg_depend d
        JOIN pg_catalog.pg_proc p ON d.objid OPERATOR(pg_catalog.=) p.oid
        JOIN pg_catalog.pg_namespace n ON p.pronamespace OPERATOR(pg_catalog.=) n.oid
        WHERE d.refclassid OPERATOR(pg_catalog.=) 'pg_catalog.pg_extension'::regclass::oid
          AND d.refobjid OPERATOR(pg_catalog.=) extension_oid
          AND d.deptype OPERATOR(pg_catalog.=) 'e'
          AND n.nspname OPERATOR(pg_catalog.=) schemaname::name
          AND (name_patterns IS NULL OR p.proname OPERATOR(pg_catalog.~~) ANY(name_patterns))
          AND (exclude_pattern IS NULL OR p.proname OPERATOR(pg_catalog.!~~) exclude_pattern)
    LOOP
        BEGIN
            EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION %s TO %I;', func_rec.func_sig, databaseowner);
        EXCEPTION WHEN OTHERS THEN
            -- Function might not exist or already granted, continue
            NULL;
        END;
    END LOOP;
END;
$$;


ALTER FUNCTION _heroku.grant_function_execute_for_extension(extension_oid oid, schemaname text, databaseowner text, name_patterns text[], exclude_pattern text) OWNER TO heroku_admin;

--
-- Name: grant_table_if_exists(text, text, text, text); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

BEGIN
  PERFORM _heroku.validate_search_path();

  IF alias_tablename IS NULL THEN
    EXECUTE pg_catalog.format('GRANT %s ON ALL TABLES IN SCHEMA %I TO %I;', grants, alias_schemaname, databaseowner);
  ELSE
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE pg_tables.schemaname OPERATOR(pg_catalog.=) alias_schemaname::name AND pg_tables.tablename OPERATOR(pg_catalog.=) alias_tablename::name) THEN
      EXECUTE pg_catalog.format('GRANT %s ON TABLE %I.%I TO %I;', grants, alias_schemaname, alias_tablename, databaseowner);
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text) OWNER TO heroku_admin;

--
-- Name: pg_stat_statements_reset(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.pg_stat_statements_reset() RETURNS timestamp with time zone
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $_$
DECLARE
  v_schema pg_catalog.text;
  v_result pg_catalog.timestamptz;
BEGIN
  SELECT n.nspname INTO v_schema
  FROM pg_catalog.pg_extension e
  JOIN pg_catalog.pg_namespace n ON n.oid OPERATOR(pg_catalog.=) e.extnamespace
  WHERE e.extname OPERATOR(pg_catalog.=) 'pg_stat_statements';

  IF v_schema IS NULL THEN
    RAISE EXCEPTION 'pg_stat_statements is not installed';
  END IF;

  EXECUTE pg_catalog.format(
    'SELECT %I.pg_stat_statements_reset($1, $2, $3)',
    v_schema
  )
  USING 0::pg_catalog.oid,
        (SELECT oid FROM pg_catalog.pg_database WHERE datname OPERATOR(pg_catalog.=) pg_catalog.current_database()),
        0::pg_catalog.int8
  INTO v_result;

  RETURN v_result;
END;
$_$;


ALTER FUNCTION _heroku.pg_stat_statements_reset() OWNER TO heroku_admin;

--
-- Name: postgis_after_create(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.postgis_after_create() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$
DECLARE
    schemaname pg_catalog.TEXT;
    databaseowner pg_catalog.TEXT;
BEGIN
    PERFORM _heroku.validate_search_path();

    schemaname := (
        SELECT n.nspname
        FROM pg_catalog.pg_extension AS e
        INNER JOIN pg_catalog.pg_namespace AS n ON e.extnamespace OPERATOR(pg_catalog.=) n.oid
        WHERE e.extname OPERATOR(pg_catalog.=) 'postgis'
    );
    databaseowner := (
        SELECT pg_catalog.pg_get_userbyid(d.datdba)
        FROM pg_catalog.pg_database d
        WHERE d.datname OPERATOR(pg_catalog.=) pg_catalog.current_database()
    );

    EXECUTE pg_catalog.format('GRANT EXECUTE ON FUNCTION %I.st_tileenvelope TO %I;', schemaname, databaseowner);
    EXECUTE pg_catalog.format('GRANT SELECT, UPDATE, INSERT, DELETE ON TABLE %I.spatial_ref_sys TO %I;', schemaname, databaseowner);
END;
$$;


ALTER FUNCTION _heroku.postgis_after_create() OWNER TO heroku_admin;

--
-- Name: sanitize_search_path(text); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.sanitize_search_path(unsafe_search_path text DEFAULT NULL::text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
  search_path_parts pg_catalog.TEXT[];
  safe_search_path pg_catalog.TEXT;
BEGIN
  IF unsafe_search_path IS NULL THEN
    unsafe_search_path := pg_catalog.current_setting('search_path');
  END IF;

  search_path_parts := pg_catalog.string_to_array(unsafe_search_path, ',');
  search_path_parts := (
    SELECT pg_catalog.array_agg(TRIM(schema_name::text))
    FROM pg_catalog.unnest(search_path_parts) AS schema_name
    WHERE TRIM(schema_name::text) OPERATOR(pg_catalog.!~~) 'pg_temp%'
  );
  search_path_parts := (SELECT pg_catalog.array_remove(search_path_parts, 'pg_catalog'));
  search_path_parts := (SELECT pg_catalog.array_append(search_path_parts, 'pg_temp'));
  SELECT pg_catalog.array_to_string(search_path_parts, ',') INTO safe_search_path;
  RETURN safe_search_path;
END;
$$;


ALTER FUNCTION _heroku.sanitize_search_path(unsafe_search_path text) OWNER TO heroku_admin;

--
-- Name: validate_extension(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.validate_extension() RETURNS event_trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$

DECLARE

  schemaname pg_catalog.text;
  extversion pg_catalog.text;
  r pg_catalog.RECORD;

BEGIN
  IF tg_tag OPERATOR(pg_catalog.=) 'CREATE EXTENSION'
       OR tg_tag OPERATOR(pg_catalog.=) 'ALTER EXTENSION' THEN
    PERFORM _heroku.validate_search_path();

    FOR r IN SELECT * FROM pg_catalog.pg_event_trigger_ddl_commands()
    LOOP
      CONTINUE WHEN (r.command_tag OPERATOR(pg_catalog.!=) 'CREATE EXTENSION'
                       AND r.command_tag OPERATOR(pg_catalog.!=) 'ALTER EXTENSION')
                    OR r.object_type OPERATOR(pg_catalog.!=) 'extension';

      SELECT n.nspname, e.extversion
        INTO schemaname, extversion
        FROM pg_catalog.pg_extension AS e
        INNER JOIN pg_catalog.pg_namespace AS n
        ON e.extnamespace OPERATOR(pg_catalog.=) n.oid
        WHERE e.oid OPERATOR(pg_catalog.=) r.objid;

      IF schemaname OPERATOR(pg_catalog.=) '_heroku' THEN
        RAISE EXCEPTION 'Extensions are not allowed in the _heroku schema';
      END IF;

      IF extversion OPERATOR(pg_catalog.=) 'unpackaged' THEN
        RAISE EXCEPTION 'Unable to perform this operation: extension version "unpackaged" is not allowed';
      END IF;
    END LOOP;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.validate_extension() OWNER TO heroku_admin;

--
-- Name: validate_extension_query(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.validate_extension_query() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$
DECLARE
  query pg_catalog.text;
BEGIN
    query := pg_catalog.unistr(pg_catalog.lower(pg_catalog.current_query()));
    IF query OPERATOR(pg_catalog.~) '\munpackaged\M' THEN
      RAISE EXCEPTION 'Unable to perform this operation: extension version "unpackaged" is not allowed';
    END IF;
END;
$$;


ALTER FUNCTION _heroku.validate_extension_query() OWNER TO heroku_admin;

--
-- Name: validate_pg_temp_clean(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.validate_pg_temp_clean() RETURNS void
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'pg_temp'
    AS $$
BEGIN
  IF pg_catalog.pg_my_temp_schema() OPERATOR(pg_catalog.!=) 0 AND EXISTS (
    SELECT 1 FROM pg_catalog.pg_class
      WHERE relnamespace OPERATOR(pg_catalog.=) pg_catalog.pg_my_temp_schema()
        AND relkind OPERATOR(pg_catalog.=) ANY(ARRAY['r', 'v', 'm', 'f', 'p', 'S']::"char"[])
    UNION ALL
    SELECT 1 FROM pg_catalog.pg_proc
      WHERE pronamespace OPERATOR(pg_catalog.=) pg_catalog.pg_my_temp_schema()
    UNION ALL
    SELECT 1 FROM pg_catalog.pg_type
      WHERE typnamespace OPERATOR(pg_catalog.=) pg_catalog.pg_my_temp_schema()
    UNION ALL
    SELECT 1 FROM pg_catalog.pg_operator
      WHERE oprnamespace OPERATOR(pg_catalog.=) pg_catalog.pg_my_temp_schema()
  ) THEN
    RAISE EXCEPTION 'Unable to perform this operation with current session state. Reset your session and try again.';
  END IF;
END;
$$;


ALTER FUNCTION _heroku.validate_pg_temp_clean() OWNER TO heroku_admin;

--
-- Name: validate_search_path(); Type: FUNCTION; Schema: _heroku; Owner: heroku_admin
--

CREATE FUNCTION _heroku.validate_search_path() RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE

  current_search_path pg_catalog.TEXT;
  safe_search_path pg_catalog.TEXT;
  current_schemas pg_catalog.TEXT[];
  pg_catalog_index pg_catalog.INT4;

BEGIN

  current_search_path := pg_catalog.current_setting('search_path');
  current_schemas := (SELECT pg_catalog.current_schemas(true));
  safe_search_path := _heroku.sanitize_search_path(current_search_path);

  IF current_schemas[1] OPERATOR(pg_catalog.~~) 'pg_temp%' THEN
    RAISE EXCEPTION 'Unable to perform this operation with current schema configuration. Try: SET search_path TO %.', safe_search_path;
  END IF;

  IF ('pg_catalog' OPERATOR(pg_catalog.=) ANY(current_schemas)) THEN
    SELECT pg_catalog.array_position(current_schemas, 'pg_catalog') INTO pg_catalog_index;
    IF pg_catalog_index OPERATOR(pg_catalog.!=) 1 THEN
      RAISE EXCEPTION 'Unable to perform this operation with current schema configuration. Try: SET search_path TO %.', safe_search_path;
    END IF;
  END IF;
END;
$$;


ALTER FUNCTION _heroku.validate_search_path() OWNER TO heroku_admin;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: files; Type: TABLE; Schema: public; Owner: uepr701d9mvmuv
--

CREATE TABLE public.files (
    aws_download_url text,
    key uuid,
    user_uuid uuid,
    file_uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    recipe_uuid uuid
);


ALTER TABLE public.files OWNER TO uepr701d9mvmuv;

--
-- Name: recipes; Type: TABLE; Schema: public; Owner: uepr701d9mvmuv
--

CREATE TABLE public.recipes (
    title character varying(100),
    category character varying(50),
    ingredients text,
    directions text,
    no_bake boolean,
    easy boolean,
    healthy boolean,
    sugar_free boolean,
    gluten_free boolean,
    dairy_free boolean,
    vegetarian boolean,
    vegan boolean,
    keto boolean,
    raw_title character varying(100),
    has_images boolean,
    default_tile_image_key character varying(50),
    recipe_uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_uuid uuid,
    high_protein boolean
);


ALTER TABLE public.recipes OWNER TO uepr701d9mvmuv;

--
-- Name: session; Type: TABLE; Schema: public; Owner: uepr701d9mvmuv
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL,
    user_uuid uuid
);


ALTER TABLE public.session OWNER TO uepr701d9mvmuv;

--
-- Name: users; Type: TABLE; Schema: public; Owner: uepr701d9mvmuv
--

CREATE TABLE public.users (
    first_name character varying(50),
    last_name character varying(50),
    password character varying(200),
    email character varying(50),
    reset_password_expires bigint,
    reset_password_token text,
    user_uuid uuid DEFAULT public.uuid_generate_v4() NOT NULL
);


ALTER TABLE public.users OWNER TO uepr701d9mvmuv;

--
-- Name: files files_pkey; Type: CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_pkey PRIMARY KEY (file_uuid);


--
-- Name: recipes recipe_unique; Type: CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipe_unique UNIQUE (recipe_uuid);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: recipes unique_recipe; Type: CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT unique_recipe PRIMARY KEY (recipe_uuid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_uuid);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: uepr701d9mvmuv
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: files files_user_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT files_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES public.users(user_uuid) ON DELETE CASCADE;


--
-- Name: files fk_file_recipe_uuid; Type: FK CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.files
    ADD CONSTRAINT fk_file_recipe_uuid FOREIGN KEY (recipe_uuid) REFERENCES public.recipes(recipe_uuid) ON DELETE CASCADE;


--
-- Name: recipes recipes_user_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES public.users(user_uuid) ON DELETE CASCADE;


--
-- Name: session session_user_uuid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: uepr701d9mvmuv
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_user_uuid_fkey FOREIGN KEY (user_uuid) REFERENCES public.users(user_uuid) ON DELETE SET NULL;


--
-- Name: SCHEMA _heroku; Type: ACL; Schema: -; Owner: heroku_admin
--

GRANT USAGE ON SCHEMA _heroku TO PUBLIC;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: uepr701d9mvmuv
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- Name: FUNCTION create_ext(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.create_ext() FROM PUBLIC;


--
-- Name: FUNCTION drop_ext(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.drop_ext() FROM PUBLIC;


--
-- Name: FUNCTION extension_before_drop(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.extension_before_drop() FROM PUBLIC;


--
-- Name: FUNCTION extension_before_run(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.extension_before_run() FROM PUBLIC;


--
-- Name: FUNCTION grant_function_execute_for_extension(extension_oid oid, schemaname text, databaseowner text, name_patterns text[], exclude_pattern text); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.grant_function_execute_for_extension(extension_oid oid, schemaname text, databaseowner text, name_patterns text[], exclude_pattern text) FROM PUBLIC;


--
-- Name: FUNCTION grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.grant_table_if_exists(alias_schemaname text, grants text, databaseowner text, alias_tablename text) FROM PUBLIC;


--
-- Name: FUNCTION postgis_after_create(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.postgis_after_create() FROM PUBLIC;


--
-- Name: FUNCTION validate_extension(); Type: ACL; Schema: _heroku; Owner: heroku_admin
--

REVOKE ALL ON FUNCTION _heroku.validate_extension() FROM PUBLIC;


--
-- Name: FUNCTION pg_stat_statements_reset(userid oid, dbid oid, queryid bigint); Type: ACL; Schema: public; Owner: rdsadmin
--

GRANT ALL ON FUNCTION public.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO uepr701d9mvmuv;
GRANT ALL ON FUNCTION public.pg_stat_statements_reset(userid oid, dbid oid, queryid bigint) TO heroku_admin;


--
-- Name: 00_validate_before_start; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER "00_validate_before_start" ON ddl_command_start
   EXECUTE FUNCTION _heroku.extension_before_run();


ALTER EVENT TRIGGER "00_validate_before_start" OWNER TO heroku_admin;

--
-- Name: 00_validate_extension_after; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER "00_validate_extension_after" ON ddl_command_end
   EXECUTE FUNCTION _heroku.validate_extension();


ALTER EVENT TRIGGER "00_validate_extension_after" OWNER TO heroku_admin;

--
-- Name: 01_configure_extension_after; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER "01_configure_extension_after" ON ddl_command_end
   EXECUTE FUNCTION _heroku.create_ext();


ALTER EVENT TRIGGER "01_configure_extension_after" OWNER TO heroku_admin;

--
-- Name: 01_configure_extension_drop; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER "01_configure_extension_drop" ON sql_drop
   EXECUTE FUNCTION _heroku.drop_ext();


ALTER EVENT TRIGGER "01_configure_extension_drop" OWNER TO heroku_admin;

--
-- Name: 01_extension_before_drop; Type: EVENT TRIGGER; Schema: -; Owner: heroku_admin
--

CREATE EVENT TRIGGER "01_extension_before_drop" ON ddl_command_start
   EXECUTE FUNCTION _heroku.extension_before_drop();


ALTER EVENT TRIGGER "01_extension_before_drop" OWNER TO heroku_admin;

--
-- PostgreSQL database dump complete
--

\unrestrict VXiz7YCfW4yBAhlpnCD5OiBkLGXmdADH2z6FOoMQkoYAQcd704ftExpGdwY7GrR

