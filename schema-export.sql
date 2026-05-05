--
-- PostgreSQL database dump
--

\restrict GUlsasPlMyA3wyTKkMAVvan6JzZgtdIYHEBs8f4DspBBnHFrzboHHebyHYlr9OM

-- Dumped from database version 14.22
-- Dumped by pg_dump version 14.22

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: figuritas; Type: TABLE; Schema: public; Owner: panini_user
--

CREATE TABLE public.figuritas (
    id character varying(50) NOT NULL,
    numero integer NOT NULL,
    nombre character varying(255) NOT NULL,
    descripcion text,
    imagen_url text,
    rareza character varying(50),
    anio integer,
    team character varying(100),
    type character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.figuritas OWNER TO panini_user;

--
-- Name: scans; Type: TABLE; Schema: public; Owner: panini_user
--

CREATE TABLE public.scans (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    figurita_id integer,
    foto_url text,
    confidence_score double precision,
    tipo character varying(50),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.scans OWNER TO panini_user;

--
-- Name: user_figuritas; Type: TABLE; Schema: public; Owner: panini_user
--

CREATE TABLE public.user_figuritas (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    figurita_id character varying(50) NOT NULL,
    cantidad integer DEFAULT 1,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_figuritas OWNER TO panini_user;

--
-- Name: users; Type: TABLE; Schema: public; Owner: panini_user
--

CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255),
    username character varying(100) NOT NULL,
    password_hash character varying(255),
    provider character varying(50) NOT NULL,
    provider_id character varying(255) NOT NULL,
    avatar_url text,
    name character varying(255),
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.users OWNER TO panini_user;

--
-- Name: figuritas figuritas_new_numero_key; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.figuritas
    ADD CONSTRAINT figuritas_new_numero_key UNIQUE (numero);


--
-- Name: figuritas figuritas_new_pkey; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.figuritas
    ADD CONSTRAINT figuritas_new_pkey PRIMARY KEY (id);


--
-- Name: scans scans_pkey; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_pkey PRIMARY KEY (id);


--
-- Name: user_figuritas user_figuritas_new_pkey; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.user_figuritas
    ADD CONSTRAINT user_figuritas_new_pkey PRIMARY KEY (id);


--
-- Name: user_figuritas user_figuritas_new_user_id_figurita_id_key; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.user_figuritas
    ADD CONSTRAINT user_figuritas_new_user_id_figurita_id_key UNIQUE (user_id, figurita_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_figuritas_anio; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_figuritas_anio ON public.figuritas USING btree (anio);


--
-- Name: idx_figuritas_numero; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_figuritas_numero ON public.figuritas USING btree (numero);


--
-- Name: idx_figuritas_rareza; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_figuritas_rareza ON public.figuritas USING btree (rareza);


--
-- Name: idx_figuritas_team; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_figuritas_team ON public.figuritas USING btree (team);


--
-- Name: idx_figuritas_type; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_figuritas_type ON public.figuritas USING btree (type);


--
-- Name: idx_scans_user; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_scans_user ON public.scans USING btree (user_id);


--
-- Name: idx_user_figuritas_figurita; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_user_figuritas_figurita ON public.user_figuritas USING btree (figurita_id);


--
-- Name: idx_user_figuritas_user; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_user_figuritas_user ON public.user_figuritas USING btree (user_id);


--
-- Name: idx_users_email; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_users_email ON public.users USING btree (email);


--
-- Name: idx_users_provider; Type: INDEX; Schema: public; Owner: panini_user
--

CREATE INDEX idx_users_provider ON public.users USING btree (provider, provider_id);


--
-- Name: scans scans_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.scans
    ADD CONSTRAINT scans_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: user_figuritas user_figuritas_new_figurita_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.user_figuritas
    ADD CONSTRAINT user_figuritas_new_figurita_id_fkey FOREIGN KEY (figurita_id) REFERENCES public.figuritas(id);


--
-- Name: user_figuritas user_figuritas_new_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: panini_user
--

ALTER TABLE ONLY public.user_figuritas
    ADD CONSTRAINT user_figuritas_new_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict GUlsasPlMyA3wyTKkMAVvan6JzZgtdIYHEBs8f4DspBBnHFrzboHHebyHYlr9OM

