-- Create tables
CREATE TABLE IF NOT EXISTS public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    email character varying(255) UNIQUE,
    username character varying(100) NOT NULL UNIQUE,
    password_hash character varying(255),
    provider character varying(50) NOT NULL,
    provider_id character varying(255) NOT NULL,
    avatar_url text,
    name character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.figuritas (
    id character varying(50) NOT NULL PRIMARY KEY,
    numero integer NOT NULL UNIQUE,
    nombre character varying(255) NOT NULL,
    descripcion text,
    imagen_url text,
    rareza character varying(50),
    anio integer,
    team character varying(100),
    type character varying(50),
    created_at timestamp without time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_figuritas (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    figurita_id character varying(50) NOT NULL REFERENCES public.figuritas(id),
    cantidad integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    UNIQUE(user_id, figurita_id)
);

CREATE TABLE IF NOT EXISTS public.scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    figurita_id integer,
    foto_url text,
    confidence_score double precision,
    tipo character varying(50),
    created_at timestamp without time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users USING btree (email);
CREATE INDEX IF NOT EXISTS idx_users_provider ON public.users USING btree (provider, provider_id);
CREATE INDEX IF NOT EXISTS idx_figuritas_numero ON public.figuritas USING btree (numero);
CREATE INDEX IF NOT EXISTS idx_figuritas_team ON public.figuritas USING btree (team);
CREATE INDEX IF NOT EXISTS idx_figuritas_type ON public.figuritas USING btree (type);
CREATE INDEX IF NOT EXISTS idx_figuritas_rareza ON public.figuritas USING btree (rareza);
CREATE INDEX IF NOT EXISTS idx_figuritas_anio ON public.figuritas USING btree (anio);
CREATE INDEX IF NOT EXISTS idx_user_figuritas_user ON public.user_figuritas USING btree (user_id);
CREATE INDEX IF NOT EXISTS idx_user_figuritas_figurita ON public.user_figuritas USING btree (figurita_id);
CREATE INDEX IF NOT EXISTS idx_scans_user ON public.scans USING btree (user_id);
