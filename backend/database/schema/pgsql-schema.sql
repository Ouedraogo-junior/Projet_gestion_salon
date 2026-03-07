--
-- PostgreSQL database dump
--

\restrict aae0Hh7ZZj2wqu0J7ix2mGyF9i6Mei4A3u5uGShMLUp4hbIdhMUA8sFCsb7IaH3

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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
-- Name: attributs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.attributs (
    id bigint NOT NULL,
    nom character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    type_valeur character varying(255) DEFAULT 'texte'::character varying NOT NULL,
    valeurs_possibles json,
    unite character varying(20),
    obligatoire boolean DEFAULT false NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT attributs_type_valeur_check CHECK (((type_valeur)::text = ANY ((ARRAY['texte'::character varying, 'nombre'::character varying, 'liste'::character varying])::text[])))
);


--
-- Name: attributs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.attributs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: attributs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.attributs_id_seq OWNED BY public.attributs.id;


--
-- Name: cache; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache (
    key character varying(255) NOT NULL,
    value text NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: cache_locks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cache_locks (
    key character varying(255) NOT NULL,
    owner character varying(255) NOT NULL,
    expiration integer NOT NULL
);


--
-- Name: categorie_attribut; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categorie_attribut (
    id bigint NOT NULL,
    categorie_id bigint NOT NULL,
    attribut_id bigint NOT NULL,
    obligatoire boolean DEFAULT false NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: categorie_attribut_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categorie_attribut_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categorie_attribut_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categorie_attribut_id_seq OWNED BY public.categorie_attribut.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories (
    id bigint NOT NULL,
    nom character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    description text,
    icone character varying(50),
    couleur character varying(20),
    is_active boolean DEFAULT true NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: categories_depenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.categories_depenses (
    id bigint NOT NULL,
    nom character varying(100) NOT NULL,
    slug character varying(100) NOT NULL,
    couleur character varying(20),
    icone character varying(50),
    is_active boolean DEFAULT true NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone
);


--
-- Name: categories_depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_depenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_depenses_id_seq OWNED BY public.categories_depenses.id;


--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.categories_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clients (
    id bigint NOT NULL,
    nom character varying(100),
    prenom character varying(100),
    telephone character varying(20) NOT NULL,
    email character varying(255),
    date_naissance date,
    adresse text,
    date_premiere_visite date DEFAULT CURRENT_DATE NOT NULL,
    date_derniere_visite date,
    points_fidelite integer DEFAULT 0 NOT NULL,
    montant_total_depense numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    notes text,
    is_active boolean DEFAULT true NOT NULL,
    sync_status character varying(255) DEFAULT 'synced'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT clients_sync_status_check CHECK (((sync_status)::text = ANY ((ARRAY['synced'::character varying, 'pending'::character varying, 'conflict'::character varying])::text[])))
);


--
-- Name: COLUMN clients.telephone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clients.telephone IS 'Format: +226XXXXXXXX';


--
-- Name: COLUMN clients.montant_total_depense; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clients.montant_total_depense IS 'Lifetime value';


--
-- Name: COLUMN clients.notes; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.clients.notes IS 'Préférences, allergies, etc.';


--
-- Name: clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;


--
-- Name: coiffeur_rendez_vous; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coiffeur_rendez_vous (
    id bigint NOT NULL,
    rendez_vous_id bigint NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: coiffeur_rendez_vous_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.coiffeur_rendez_vous_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: coiffeur_rendez_vous_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.coiffeur_rendez_vous_id_seq OWNED BY public.coiffeur_rendez_vous.id;


--
-- Name: confection_attributs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.confection_attributs (
    id bigint NOT NULL,
    confection_id bigint NOT NULL,
    attribut_id bigint NOT NULL,
    valeur character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: confection_attributs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.confection_attributs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: confection_attributs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.confection_attributs_id_seq OWNED BY public.confection_attributs.id;


--
-- Name: confection_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.confection_details (
    id bigint NOT NULL,
    confection_id bigint NOT NULL,
    quantite_utilisee integer NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    prix_total numeric(10,2) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    variante_id bigint
);


--
-- Name: confection_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.confection_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: confection_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.confection_details_id_seq OWNED BY public.confection_details.id;


--
-- Name: confections; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.confections (
    id bigint NOT NULL,
    numero_confection character varying(50) NOT NULL,
    user_id bigint NOT NULL,
    categorie_id bigint NOT NULL,
    nom_produit character varying(255) NOT NULL,
    quantite_produite integer NOT NULL,
    description text,
    date_confection date NOT NULL,
    cout_matiere_premiere numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    cout_main_oeuvre numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    cout_total numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    prix_vente_unitaire numeric(10,2),
    statut character varying(255) DEFAULT 'en_cours'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    destination character varying(255) DEFAULT 'vente'::character varying NOT NULL,
    variante_id bigint,
    CONSTRAINT confections_destination_check CHECK (((destination)::text = ANY ((ARRAY['vente'::character varying, 'utilisation'::character varying, 'mixte'::character varying])::text[]))),
    CONSTRAINT confections_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_cours'::character varying, 'terminee'::character varying, 'annulee'::character varying])::text[])))
);


--
-- Name: COLUMN confections.destination; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.confections.destination IS 'Destination du produit confectionné';


--
-- Name: confections_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.confections_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: confections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.confections_id_seq OWNED BY public.confections.id;


--
-- Name: depenses; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.depenses (
    id bigint NOT NULL,
    libelle character varying(255) NOT NULL,
    montant numeric(10,2) NOT NULL,
    description text,
    date_depense date NOT NULL,
    user_id bigint NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    categorie_depense_id bigint
);


--
-- Name: depenses_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.depenses_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: depenses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.depenses_id_seq OWNED BY public.depenses.id;


--
-- Name: failed_jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.failed_jobs (
    id bigint NOT NULL,
    uuid character varying(255) NOT NULL,
    connection text NOT NULL,
    queue text NOT NULL,
    payload text NOT NULL,
    exception text NOT NULL,
    failed_at timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.failed_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: failed_jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.failed_jobs_id_seq OWNED BY public.failed_jobs.id;


--
-- Name: job_batches; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.job_batches (
    id character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    total_jobs integer NOT NULL,
    pending_jobs integer NOT NULL,
    failed_jobs integer NOT NULL,
    failed_job_ids text NOT NULL,
    options text,
    cancelled_at integer,
    created_at integer NOT NULL,
    finished_at integer
);


--
-- Name: jobs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.jobs (
    id bigint NOT NULL,
    queue character varying(255) NOT NULL,
    payload text NOT NULL,
    attempts smallint NOT NULL,
    reserved_at integer,
    available_at integer NOT NULL,
    created_at integer NOT NULL
);


--
-- Name: jobs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: jobs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.jobs_id_seq OWNED BY public.jobs.id;


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    id integer NOT NULL,
    migration character varying(255) NOT NULL,
    batch integer NOT NULL
);


--
-- Name: migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.migrations_id_seq OWNED BY public.migrations.id;


--
-- Name: mouvements_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.mouvements_stock (
    id bigint NOT NULL,
    type_mouvement character varying(255) NOT NULL,
    quantite integer NOT NULL,
    stock_avant integer NOT NULL,
    stock_apres integer NOT NULL,
    motif text,
    vente_id bigint,
    user_id bigint,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    type_stock character varying(255) DEFAULT 'vente'::character varying NOT NULL,
    transfert_id bigint,
    confection_id bigint,
    variante_id bigint,
    CONSTRAINT mouvements_stock_type_mouvement_check CHECK (((type_mouvement)::text = ANY ((ARRAY['entree'::character varying, 'sortie'::character varying, 'ajustement'::character varying, 'inventaire'::character varying])::text[]))),
    CONSTRAINT mouvements_stock_type_stock_check CHECK (((type_stock)::text = ANY ((ARRAY['vente'::character varying, 'utilisation'::character varying, 'reserve'::character varying])::text[])))
);


--
-- Name: mouvements_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.mouvements_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: mouvements_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.mouvements_stock_id_seq OWNED BY public.mouvements_stock.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id bigint NOT NULL,
    user_id bigint,
    type character varying(255) NOT NULL,
    titre character varying(255) NOT NULL,
    message text NOT NULL,
    data json,
    priorite character varying(255) DEFAULT 'normale'::character varying NOT NULL,
    lu boolean DEFAULT false NOT NULL,
    lu_at timestamp(0) without time zone,
    lien character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT notifications_priorite_check CHECK (((priorite)::text = ANY ((ARRAY['basse'::character varying, 'normale'::character varying, 'haute'::character varying, 'critique'::character varying])::text[])))
);


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: personal_access_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.personal_access_tokens (
    id bigint NOT NULL,
    tokenable_type character varying(255) NOT NULL,
    tokenable_id bigint NOT NULL,
    name text NOT NULL,
    token character varying(64) NOT NULL,
    abilities text,
    last_used_at timestamp(0) without time zone,
    expires_at timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.personal_access_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: personal_access_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.personal_access_tokens_id_seq OWNED BY public.personal_access_tokens.id;


--
-- Name: photos_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photos_clients (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    vente_id bigint,
    rendez_vous_id bigint,
    photo_url character varying(255) NOT NULL,
    type_photo character varying(255) NOT NULL,
    description text,
    date_prise date DEFAULT CURRENT_DATE NOT NULL,
    is_public boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT photos_clients_type_photo_check CHECK (((type_photo)::text = ANY ((ARRAY['avant'::character varying, 'apres'::character varying])::text[])))
);


--
-- Name: COLUMN photos_clients.is_public; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.photos_clients.is_public IS 'Pour portfolio public';


--
-- Name: photos_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.photos_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: photos_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.photos_clients_id_seq OWNED BY public.photos_clients.id;


--
-- Name: pointages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pointages (
    id bigint NOT NULL,
    user_id bigint NOT NULL,
    pointeur_id bigint,
    date_pointage date NOT NULL,
    heure_arrivee time(0) without time zone NOT NULL,
    heure_depart time(0) without time zone,
    minutes_travailles integer,
    statut character varying(255) DEFAULT 'present'::character varying NOT NULL,
    type_pointage character varying(255) DEFAULT 'manuel'::character varying NOT NULL,
    commentaire text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT pointages_statut_check CHECK (((statut)::text = ANY ((ARRAY['present'::character varying, 'retard'::character varying, 'absent'::character varying, 'conge'::character varying])::text[])))
);


--
-- Name: pointages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.pointages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: pointages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.pointages_id_seq OWNED BY public.pointages.id;


--
-- Name: prestations_clients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.prestations_clients (
    id bigint NOT NULL,
    vente_id bigint NOT NULL,
    client_id bigint NOT NULL,
    coiffeur_id bigint,
    type_prestation_id bigint NOT NULL,
    date_prestation timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    montant_main_oeuvre numeric(10,2) NOT NULL,
    montant_produits_utilises numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    montant_total numeric(10,2) NOT NULL,
    produits_utilises json,
    commentaires text,
    problemes_rencontres text,
    recommandations text,
    a_photos boolean DEFAULT false NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: COLUMN prestations_clients.produits_utilises; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.prestations_clients.produits_utilises IS 'Ex: [{"produit":"Mèches 18\"","quantite":2,"montant":5000}]';


--
-- Name: COLUMN prestations_clients.commentaires; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.prestations_clients.commentaires IS 'Observations importantes';


--
-- Name: COLUMN prestations_clients.problemes_rencontres; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.prestations_clients.problemes_rencontres IS 'Allergies, fragilité cheveux, etc.';


--
-- Name: COLUMN prestations_clients.recommandations; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.prestations_clients.recommandations IS 'Pour prochaine visite';


--
-- Name: prestations_clients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.prestations_clients_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: prestations_clients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.prestations_clients_id_seq OWNED BY public.prestations_clients.id;


--
-- Name: produit_attribut_valeurs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produit_attribut_valeurs (
    id bigint NOT NULL,
    attribut_id bigint NOT NULL,
    valeur character varying(255) NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    variante_id bigint
);


--
-- Name: produit_attribut_valeurs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produit_attribut_valeurs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produit_attribut_valeurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produit_attribut_valeurs_id_seq OWNED BY public.produit_attribut_valeurs.id;


--
-- Name: produit_variantes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produit_variantes (
    id bigint NOT NULL,
    produit_id bigint NOT NULL,
    reference character varying(50),
    prix_achat numeric(10,2) NOT NULL,
    prix_vente numeric(10,2) NOT NULL,
    prix_promo numeric(10,2),
    date_debut_promo date,
    date_fin_promo date,
    stock_vente integer DEFAULT 0 NOT NULL,
    stock_utilisation integer DEFAULT 0 NOT NULL,
    stock_reserve integer DEFAULT 0 NOT NULL,
    seuil_alerte integer,
    seuil_critique integer,
    seuil_alerte_utilisation integer,
    seuil_critique_utilisation integer,
    seuil_alerte_reserve integer,
    seuil_critique_reserve integer,
    type_stock_principal character varying(50) DEFAULT 'mixte'::character varying NOT NULL,
    devise_achat character varying(10) DEFAULT 'FCFA'::character varying NOT NULL,
    prix_achat_devise_origine numeric(12,2),
    taux_change numeric(10,4),
    frais_cmb numeric(10,2),
    frais_transit numeric(10,2),
    frais_bancaires numeric(10,2),
    frais_courtier numeric(10,2),
    frais_transport_local numeric(10,2),
    montant_total_achat numeric(10,2),
    prix_achat_stock_total numeric(12,2),
    moyen_paiement character varying(50),
    date_commande date,
    date_reception date,
    quantite_stock_commande integer,
    quantite_min_commande integer,
    delai_livraison_jours integer,
    cbm numeric(10,4),
    poids_kg numeric(10,2),
    statut_validation character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    valide_par bigint,
    valide_le timestamp(0) without time zone,
    motif_rejet text,
    cree_par bigint,
    sync_status character varying(255) DEFAULT 'synced'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: produit_variantes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produit_variantes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produit_variantes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produit_variantes_id_seq OWNED BY public.produit_variantes.id;


--
-- Name: produits; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.produits (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    categorie_id bigint NOT NULL,
    marque character varying(100),
    fournisseur character varying(100),
    photo_url character varying(255),
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    visible_public boolean DEFAULT true NOT NULL,
    salon_id bigint DEFAULT '1'::bigint NOT NULL
);


--
-- Name: produits_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.produits_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: produits_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.produits_id_seq OWNED BY public.produits.id;


--
-- Name: rendez_vous; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rendez_vous (
    id bigint NOT NULL,
    client_id bigint NOT NULL,
    coiffeur_id bigint,
    date_heure timestamp(0) without time zone NOT NULL,
    duree_minutes integer NOT NULL,
    prix_estime numeric(10,2),
    statut character varying(255) DEFAULT 'en_attente'::character varying NOT NULL,
    notes text,
    acompte_demande boolean DEFAULT false NOT NULL,
    acompte_montant numeric(10,2),
    acompte_paye boolean DEFAULT false NOT NULL,
    sms_confirmation_envoye boolean DEFAULT false NOT NULL,
    sms_rappel_24h_envoye boolean DEFAULT false NOT NULL,
    sms_rappel_2h_envoye boolean DEFAULT false NOT NULL,
    motif_annulation text,
    date_annulation timestamp(0) without time zone,
    sync_status character varying(255) DEFAULT 'synced'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT rendez_vous_statut_check CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'confirme'::character varying, 'en_cours'::character varying, 'termine'::character varying, 'annule'::character varying, 'no_show'::character varying])::text[]))),
    CONSTRAINT rendez_vous_sync_status_check CHECK (((sync_status)::text = ANY ((ARRAY['synced'::character varying, 'pending'::character varying, 'conflict'::character varying])::text[])))
);


--
-- Name: rendez_vous_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rendez_vous_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rendez_vous_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rendez_vous_id_seq OWNED BY public.rendez_vous.id;


--
-- Name: rendez_vous_paiements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rendez_vous_paiements (
    id bigint NOT NULL,
    rendez_vous_id bigint NOT NULL,
    type_paiement character varying(255) NOT NULL,
    montant numeric(10,2) NOT NULL,
    mode_paiement character varying(255) NOT NULL,
    reference_transaction character varying(100),
    date_paiement timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    user_id bigint NOT NULL,
    notes text,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT rendez_vous_paiements_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'orange_money'::character varying, 'moov_money'::character varying, 'carte'::character varying])::text[]))),
    CONSTRAINT rendez_vous_paiements_type_paiement_check CHECK (((type_paiement)::text = ANY ((ARRAY['acompte'::character varying, 'solde'::character varying])::text[])))
);


--
-- Name: rendez_vous_paiements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rendez_vous_paiements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rendez_vous_paiements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rendez_vous_paiements_id_seq OWNED BY public.rendez_vous_paiements.id;


--
-- Name: rendez_vous_prestations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.rendez_vous_prestations (
    id bigint NOT NULL,
    rendez_vous_id bigint NOT NULL,
    type_prestation_id bigint NOT NULL,
    ordre integer DEFAULT 1 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone
);


--
-- Name: rendez_vous_prestations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.rendez_vous_prestations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: rendez_vous_prestations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.rendez_vous_prestations_id_seq OWNED BY public.rendez_vous_prestations.id;


--
-- Name: salons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.salons (
    id bigint NOT NULL,
    nom character varying(100) NOT NULL,
    adresse character varying(255) NOT NULL,
    telephone character varying(20) NOT NULL,
    email character varying(255),
    horaires text,
    logo_url character varying(255),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    slug character varying(255),
    is_active boolean DEFAULT true NOT NULL
);


--
-- Name: COLUMN salons.horaires; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.salons.horaires IS 'Horaires d''ouverture';


--
-- Name: salons_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.salons_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: salons_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.salons_id_seq OWNED BY public.salons.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.sessions (
    id character varying(255) NOT NULL,
    user_id bigint,
    ip_address character varying(45),
    user_agent text,
    payload text NOT NULL,
    last_activity integer NOT NULL
);


--
-- Name: transferts_stock; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.transferts_stock (
    id bigint NOT NULL,
    numero_transfert character varying(50) NOT NULL,
    type_transfert character varying(255) NOT NULL,
    quantite integer NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    montant_total numeric(10,2) NOT NULL,
    motif text,
    user_id bigint NOT NULL,
    valide boolean DEFAULT false NOT NULL,
    valideur_id bigint,
    date_validation timestamp(0) without time zone,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    variante_id bigint,
    CONSTRAINT transferts_stock_type_transfert_check CHECK (((type_transfert)::text = ANY ((ARRAY['vente_vers_utilisation'::character varying, 'utilisation_vers_vente'::character varying, 'reserve_vers_vente'::character varying, 'reserve_vers_utilisation'::character varying, 'vente_vers_reserve'::character varying, 'utilisation_vers_reserve'::character varying])::text[])))
);


--
-- Name: COLUMN transferts_stock.prix_unitaire; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.transferts_stock.prix_unitaire IS 'Prix auquel le transfert est valorisé';


--
-- Name: COLUMN transferts_stock.valide; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.transferts_stock.valide IS 'Validation gérant si nécessaire';


--
-- Name: transferts_stock_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.transferts_stock_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: transferts_stock_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.transferts_stock_id_seq OWNED BY public.transferts_stock.id;


--
-- Name: types_prestations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.types_prestations (
    id bigint NOT NULL,
    nom character varying(255) NOT NULL,
    description text,
    duree_estimee_minutes integer,
    prix_base numeric(10,2),
    actif boolean DEFAULT true NOT NULL,
    ordre integer DEFAULT 0 NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    salon_id bigint DEFAULT '1'::bigint NOT NULL,
    acompte_requis boolean DEFAULT false NOT NULL,
    acompte_montant numeric(10,2),
    acompte_pourcentage numeric(5,2)
);


--
-- Name: types_prestations_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.types_prestations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: types_prestations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.types_prestations_id_seq OWNED BY public.types_prestations.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id bigint NOT NULL,
    nom character varying(100) NOT NULL,
    prenom character varying(100) NOT NULL,
    telephone character varying(20) NOT NULL,
    email character varying(255),
    password character varying(255) NOT NULL,
    role character varying(255) DEFAULT 'coiffeur'::character varying NOT NULL,
    photo_url character varying(255),
    specialite character varying(100),
    is_active boolean DEFAULT true NOT NULL,
    email_verified_at timestamp(0) without time zone,
    remember_token character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    salaire_mensuel numeric(10,2),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['gerant'::character varying, 'coiffeur'::character varying, 'gestionnaire'::character varying])::text[])))
);


--
-- Name: COLUMN users.telephone; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.telephone IS 'Format: +226XXXXXXXX';


--
-- Name: COLUMN users.password; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.password IS 'Code PIN 6 chiffres hashé';


--
-- Name: COLUMN users.specialite; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.specialite IS 'Spécialité du coiffeur';


--
-- Name: COLUMN users.salaire_mensuel; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.salaire_mensuel IS 'Salaire mensuel en FCFA';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: ventes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventes (
    id bigint NOT NULL,
    numero_facture character varying(50) NOT NULL,
    client_id bigint,
    client_nom character varying(100),
    client_telephone character varying(20),
    coiffeur_id bigint,
    vendeur_id bigint NOT NULL,
    rendez_vous_id bigint,
    type_vente character varying(255) DEFAULT 'mixte'::character varying NOT NULL,
    date_vente timestamp(0) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    montant_prestations numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    montant_produits numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    montant_total_ht numeric(10,2) NOT NULL,
    montant_reduction numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    type_reduction character varying(255),
    montant_total_ttc numeric(10,2) NOT NULL,
    mode_paiement character varying(255) NOT NULL,
    montant_paye numeric(10,2) NOT NULL,
    montant_rendu numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    statut_paiement character varying(255) DEFAULT 'paye'::character varying NOT NULL,
    solde_restant numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    recu_imprime boolean DEFAULT false NOT NULL,
    points_gagnes integer DEFAULT 0 NOT NULL,
    points_utilises integer DEFAULT 0 NOT NULL,
    notes text,
    sync_status character varying(255) DEFAULT 'synced'::character varying NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    deleted_at timestamp(0) without time zone,
    CONSTRAINT ventes_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'orange_money'::character varying, 'moov_money'::character varying, 'carte'::character varying, 'mixte'::character varying])::text[]))),
    CONSTRAINT ventes_statut_paiement_check CHECK (((statut_paiement)::text = ANY ((ARRAY['paye'::character varying, 'partiel'::character varying, 'impaye'::character varying])::text[]))),
    CONSTRAINT ventes_sync_status_check CHECK (((sync_status)::text = ANY ((ARRAY['synced'::character varying, 'pending'::character varying, 'conflict'::character varying])::text[]))),
    CONSTRAINT ventes_type_reduction_check CHECK (((type_reduction)::text = ANY ((ARRAY['fidelite'::character varying, 'promo'::character varying, 'manuelle'::character varying, 'aucune'::character varying])::text[]))),
    CONSTRAINT ventes_type_vente_check CHECK (((type_vente)::text = ANY ((ARRAY['prestations'::character varying, 'produits'::character varying, 'mixte'::character varying])::text[])))
);


--
-- Name: ventes_details; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventes_details (
    id bigint NOT NULL,
    vente_id bigint NOT NULL,
    type_article character varying(255) NOT NULL,
    article_nom character varying(255) NOT NULL,
    prestation_id bigint,
    produit_reference character varying(50),
    quantite integer DEFAULT 1 NOT NULL,
    prix_unitaire numeric(10,2) NOT NULL,
    prix_total numeric(10,2) NOT NULL,
    reduction numeric(10,2) DEFAULT '0'::numeric NOT NULL,
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    variante_id bigint,
    CONSTRAINT ventes_details_type_article_check CHECK (((type_article)::text = ANY ((ARRAY['prestation'::character varying, 'produit'::character varying])::text[])))
);


--
-- Name: ventes_details_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventes_details_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventes_details_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventes_details_id_seq OWNED BY public.ventes_details.id;


--
-- Name: ventes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventes_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventes_id_seq OWNED BY public.ventes.id;


--
-- Name: ventes_paiements; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ventes_paiements (
    id bigint NOT NULL,
    vente_id bigint NOT NULL,
    mode_paiement character varying(255) NOT NULL,
    montant numeric(10,2) NOT NULL,
    reference_transaction character varying(100),
    created_at timestamp(0) without time zone,
    updated_at timestamp(0) without time zone,
    CONSTRAINT ventes_paiements_mode_paiement_check CHECK (((mode_paiement)::text = ANY ((ARRAY['especes'::character varying, 'orange_money'::character varying, 'moov_money'::character varying, 'carte'::character varying])::text[])))
);


--
-- Name: ventes_paiements_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ventes_paiements_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ventes_paiements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ventes_paiements_id_seq OWNED BY public.ventes_paiements.id;


--
-- Name: attributs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attributs ALTER COLUMN id SET DEFAULT nextval('public.attributs_id_seq'::regclass);


--
-- Name: categorie_attribut id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie_attribut ALTER COLUMN id SET DEFAULT nextval('public.categorie_attribut_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: categories_depenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_depenses ALTER COLUMN id SET DEFAULT nextval('public.categories_depenses_id_seq'::regclass);


--
-- Name: clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);


--
-- Name: coiffeur_rendez_vous id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coiffeur_rendez_vous ALTER COLUMN id SET DEFAULT nextval('public.coiffeur_rendez_vous_id_seq'::regclass);


--
-- Name: confection_attributs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_attributs ALTER COLUMN id SET DEFAULT nextval('public.confection_attributs_id_seq'::regclass);


--
-- Name: confection_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_details ALTER COLUMN id SET DEFAULT nextval('public.confection_details_id_seq'::regclass);


--
-- Name: confections id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections ALTER COLUMN id SET DEFAULT nextval('public.confections_id_seq'::regclass);


--
-- Name: depenses id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses ALTER COLUMN id SET DEFAULT nextval('public.depenses_id_seq'::regclass);


--
-- Name: failed_jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs ALTER COLUMN id SET DEFAULT nextval('public.failed_jobs_id_seq'::regclass);


--
-- Name: jobs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs ALTER COLUMN id SET DEFAULT nextval('public.jobs_id_seq'::regclass);


--
-- Name: migrations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations ALTER COLUMN id SET DEFAULT nextval('public.migrations_id_seq'::regclass);


--
-- Name: mouvements_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock ALTER COLUMN id SET DEFAULT nextval('public.mouvements_stock_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: personal_access_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens ALTER COLUMN id SET DEFAULT nextval('public.personal_access_tokens_id_seq'::regclass);


--
-- Name: photos_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_clients ALTER COLUMN id SET DEFAULT nextval('public.photos_clients_id_seq'::regclass);


--
-- Name: pointages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pointages ALTER COLUMN id SET DEFAULT nextval('public.pointages_id_seq'::regclass);


--
-- Name: prestations_clients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients ALTER COLUMN id SET DEFAULT nextval('public.prestations_clients_id_seq'::regclass);


--
-- Name: produit_attribut_valeurs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_attribut_valeurs ALTER COLUMN id SET DEFAULT nextval('public.produit_attribut_valeurs_id_seq'::regclass);


--
-- Name: produit_variantes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes ALTER COLUMN id SET DEFAULT nextval('public.produit_variantes_id_seq'::regclass);


--
-- Name: produits id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produits ALTER COLUMN id SET DEFAULT nextval('public.produits_id_seq'::regclass);


--
-- Name: rendez_vous id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous ALTER COLUMN id SET DEFAULT nextval('public.rendez_vous_id_seq'::regclass);


--
-- Name: rendez_vous_paiements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_paiements ALTER COLUMN id SET DEFAULT nextval('public.rendez_vous_paiements_id_seq'::regclass);


--
-- Name: rendez_vous_prestations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_prestations ALTER COLUMN id SET DEFAULT nextval('public.rendez_vous_prestations_id_seq'::regclass);


--
-- Name: salons id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons ALTER COLUMN id SET DEFAULT nextval('public.salons_id_seq'::regclass);


--
-- Name: transferts_stock id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock ALTER COLUMN id SET DEFAULT nextval('public.transferts_stock_id_seq'::regclass);


--
-- Name: types_prestations id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_prestations ALTER COLUMN id SET DEFAULT nextval('public.types_prestations_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: ventes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes ALTER COLUMN id SET DEFAULT nextval('public.ventes_id_seq'::regclass);


--
-- Name: ventes_details id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_details ALTER COLUMN id SET DEFAULT nextval('public.ventes_details_id_seq'::regclass);


--
-- Name: ventes_paiements id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_paiements ALTER COLUMN id SET DEFAULT nextval('public.ventes_paiements_id_seq'::regclass);


--
-- Name: attributs attributs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attributs
    ADD CONSTRAINT attributs_pkey PRIMARY KEY (id);


--
-- Name: attributs attributs_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.attributs
    ADD CONSTRAINT attributs_slug_unique UNIQUE (slug);


--
-- Name: cache_locks cache_locks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache_locks
    ADD CONSTRAINT cache_locks_pkey PRIMARY KEY (key);


--
-- Name: cache cache_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.cache
    ADD CONSTRAINT cache_pkey PRIMARY KEY (key);


--
-- Name: categorie_attribut categorie_attribut_categorie_id_attribut_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie_attribut
    ADD CONSTRAINT categorie_attribut_categorie_id_attribut_id_unique UNIQUE (categorie_id, attribut_id);


--
-- Name: categorie_attribut categorie_attribut_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie_attribut
    ADD CONSTRAINT categorie_attribut_pkey PRIMARY KEY (id);


--
-- Name: categories_depenses categories_depenses_nom_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_depenses
    ADD CONSTRAINT categories_depenses_nom_unique UNIQUE (nom);


--
-- Name: categories_depenses categories_depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_depenses
    ADD CONSTRAINT categories_depenses_pkey PRIMARY KEY (id);


--
-- Name: categories_depenses categories_depenses_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories_depenses
    ADD CONSTRAINT categories_depenses_slug_unique UNIQUE (slug);


--
-- Name: categories categories_nom_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_nom_unique UNIQUE (nom);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_unique UNIQUE (slug);


--
-- Name: clients clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);


--
-- Name: clients clients_telephone_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_telephone_unique UNIQUE (telephone);


--
-- Name: coiffeur_rendez_vous coiffeur_rendez_vous_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coiffeur_rendez_vous
    ADD CONSTRAINT coiffeur_rendez_vous_pkey PRIMARY KEY (id);


--
-- Name: coiffeur_rendez_vous coiffeur_rendez_vous_rendez_vous_id_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coiffeur_rendez_vous
    ADD CONSTRAINT coiffeur_rendez_vous_rendez_vous_id_user_id_unique UNIQUE (rendez_vous_id, user_id);


--
-- Name: confection_attributs confection_attributs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_attributs
    ADD CONSTRAINT confection_attributs_pkey PRIMARY KEY (id);


--
-- Name: confection_details confection_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_details
    ADD CONSTRAINT confection_details_pkey PRIMARY KEY (id);


--
-- Name: confections confections_numero_confection_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections
    ADD CONSTRAINT confections_numero_confection_unique UNIQUE (numero_confection);


--
-- Name: confections confections_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections
    ADD CONSTRAINT confections_pkey PRIMARY KEY (id);


--
-- Name: depenses depenses_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_pkey PRIMARY KEY (id);


--
-- Name: failed_jobs failed_jobs_uuid_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.failed_jobs
    ADD CONSTRAINT failed_jobs_uuid_unique UNIQUE (uuid);


--
-- Name: job_batches job_batches_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.job_batches
    ADD CONSTRAINT job_batches_pkey PRIMARY KEY (id);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: mouvements_stock mouvements_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_pkey PRIMARY KEY (id);


--
-- Name: personal_access_tokens personal_access_tokens_token_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.personal_access_tokens
    ADD CONSTRAINT personal_access_tokens_token_unique UNIQUE (token);


--
-- Name: photos_clients photos_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_clients
    ADD CONSTRAINT photos_clients_pkey PRIMARY KEY (id);


--
-- Name: pointages pointages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pointages
    ADD CONSTRAINT pointages_pkey PRIMARY KEY (id);


--
-- Name: pointages pointages_user_id_date_pointage_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pointages
    ADD CONSTRAINT pointages_user_id_date_pointage_unique UNIQUE (user_id, date_pointage);


--
-- Name: prestations_clients prestations_clients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients
    ADD CONSTRAINT prestations_clients_pkey PRIMARY KEY (id);


--
-- Name: produit_attribut_valeurs produit_attribut_valeurs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_attribut_valeurs
    ADD CONSTRAINT produit_attribut_valeurs_pkey PRIMARY KEY (id);


--
-- Name: produit_variantes produit_variantes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes
    ADD CONSTRAINT produit_variantes_pkey PRIMARY KEY (id);


--
-- Name: produit_variantes produit_variantes_reference_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes
    ADD CONSTRAINT produit_variantes_reference_unique UNIQUE (reference);


--
-- Name: produits produits_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_pkey PRIMARY KEY (id);


--
-- Name: rendez_vous_paiements rendez_vous_paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_paiements
    ADD CONSTRAINT rendez_vous_paiements_pkey PRIMARY KEY (id);


--
-- Name: rendez_vous rendez_vous_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous
    ADD CONSTRAINT rendez_vous_pkey PRIMARY KEY (id);


--
-- Name: rendez_vous_prestations rendez_vous_prestations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_prestations
    ADD CONSTRAINT rendez_vous_prestations_pkey PRIMARY KEY (id);


--
-- Name: salons salons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_pkey PRIMARY KEY (id);


--
-- Name: salons salons_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.salons
    ADD CONSTRAINT salons_slug_unique UNIQUE (slug);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: transferts_stock transferts_stock_numero_transfert_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock
    ADD CONSTRAINT transferts_stock_numero_transfert_unique UNIQUE (numero_transfert);


--
-- Name: transferts_stock transferts_stock_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock
    ADD CONSTRAINT transferts_stock_pkey PRIMARY KEY (id);


--
-- Name: types_prestations types_prestations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_prestations
    ADD CONSTRAINT types_prestations_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_telephone_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_telephone_unique UNIQUE (telephone);


--
-- Name: ventes_details ventes_details_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_details
    ADD CONSTRAINT ventes_details_pkey PRIMARY KEY (id);


--
-- Name: ventes ventes_numero_facture_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_numero_facture_unique UNIQUE (numero_facture);


--
-- Name: ventes_paiements ventes_paiements_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_paiements
    ADD CONSTRAINT ventes_paiements_pkey PRIMARY KEY (id);


--
-- Name: ventes ventes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_pkey PRIMARY KEY (id);


--
-- Name: attributs_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX attributs_slug_index ON public.attributs USING btree (slug);


--
-- Name: cache_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_expiration_index ON public.cache USING btree (expiration);


--
-- Name: cache_locks_expiration_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX cache_locks_expiration_index ON public.cache_locks USING btree (expiration);


--
-- Name: categories_depenses_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_depenses_is_active_index ON public.categories_depenses USING btree (is_active);


--
-- Name: categories_depenses_ordre_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_depenses_ordre_index ON public.categories_depenses USING btree (ordre);


--
-- Name: categories_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_is_active_index ON public.categories USING btree (is_active);


--
-- Name: categories_ordre_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX categories_ordre_index ON public.categories USING btree (ordre);


--
-- Name: clients_date_derniere_visite_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_date_derniere_visite_index ON public.clients USING btree (date_derniere_visite);


--
-- Name: clients_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_is_active_index ON public.clients USING btree (is_active);


--
-- Name: clients_nom_prenom_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_nom_prenom_index ON public.clients USING btree (nom, prenom);


--
-- Name: clients_points_fidelite_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_points_fidelite_index ON public.clients USING btree (points_fidelite);


--
-- Name: clients_sync_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_sync_status_index ON public.clients USING btree (sync_status);


--
-- Name: clients_telephone_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX clients_telephone_index ON public.clients USING btree (telephone);


--
-- Name: coiffeur_rendez_vous_rendez_vous_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coiffeur_rendez_vous_rendez_vous_id_index ON public.coiffeur_rendez_vous USING btree (rendez_vous_id);


--
-- Name: coiffeur_rendez_vous_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX coiffeur_rendez_vous_user_id_index ON public.coiffeur_rendez_vous USING btree (user_id);


--
-- Name: confection_attributs_confection_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confection_attributs_confection_id_index ON public.confection_attributs USING btree (confection_id);


--
-- Name: confection_details_confection_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confection_details_confection_id_index ON public.confection_details USING btree (confection_id);


--
-- Name: confections_date_confection_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confections_date_confection_index ON public.confections USING btree (date_confection);


--
-- Name: confections_destination_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confections_destination_index ON public.confections USING btree (destination);


--
-- Name: confections_statut_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confections_statut_index ON public.confections USING btree (statut);


--
-- Name: confections_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX confections_user_id_index ON public.confections USING btree (user_id);


--
-- Name: jobs_queue_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX jobs_queue_index ON public.jobs USING btree (queue);


--
-- Name: mouvements_stock_confection_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mouvements_stock_confection_id_index ON public.mouvements_stock USING btree (confection_id);


--
-- Name: mouvements_stock_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mouvements_stock_created_at_index ON public.mouvements_stock USING btree (created_at);


--
-- Name: mouvements_stock_transfert_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mouvements_stock_transfert_id_index ON public.mouvements_stock USING btree (transfert_id);


--
-- Name: mouvements_stock_type_mouvement_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mouvements_stock_type_mouvement_index ON public.mouvements_stock USING btree (type_mouvement);


--
-- Name: mouvements_stock_type_stock_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX mouvements_stock_type_stock_index ON public.mouvements_stock USING btree (type_stock);


--
-- Name: notifications_type_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_type_index ON public.notifications USING btree (type);


--
-- Name: notifications_user_id_lu_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_lu_created_at_index ON public.notifications USING btree (user_id, lu, created_at);


--
-- Name: personal_access_tokens_expires_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_expires_at_index ON public.personal_access_tokens USING btree (expires_at);


--
-- Name: personal_access_tokens_tokenable_type_tokenable_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index ON public.personal_access_tokens USING btree (tokenable_type, tokenable_id);


--
-- Name: photos_clients_client_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX photos_clients_client_id_index ON public.photos_clients USING btree (client_id);


--
-- Name: photos_clients_is_public_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX photos_clients_is_public_index ON public.photos_clients USING btree (is_public);


--
-- Name: photos_clients_type_photo_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX photos_clients_type_photo_index ON public.photos_clients USING btree (type_photo);


--
-- Name: pointages_date_pointage_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pointages_date_pointage_index ON public.pointages USING btree (date_pointage);


--
-- Name: pointages_statut_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX pointages_statut_index ON public.pointages USING btree (statut);


--
-- Name: prestations_clients_client_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prestations_clients_client_id_index ON public.prestations_clients USING btree (client_id);


--
-- Name: prestations_clients_coiffeur_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prestations_clients_coiffeur_id_index ON public.prestations_clients USING btree (coiffeur_id);


--
-- Name: prestations_clients_date_prestation_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX prestations_clients_date_prestation_index ON public.prestations_clients USING btree (date_prestation);


--
-- Name: produits_categorie_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX produits_categorie_id_index ON public.produits USING btree (categorie_id);


--
-- Name: produits_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX produits_is_active_index ON public.produits USING btree (is_active);


--
-- Name: produits_nom_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX produits_nom_index ON public.produits USING btree (nom);


--
-- Name: produits_salon_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX produits_salon_id_index ON public.produits USING btree (salon_id);


--
-- Name: produits_visible_public_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX produits_visible_public_index ON public.produits USING btree (visible_public);


--
-- Name: rendez_vous_client_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_client_id_index ON public.rendez_vous USING btree (client_id);


--
-- Name: rendez_vous_coiffeur_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_coiffeur_id_index ON public.rendez_vous USING btree (coiffeur_id);


--
-- Name: rendez_vous_date_heure_coiffeur_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_date_heure_coiffeur_id_index ON public.rendez_vous USING btree (date_heure, coiffeur_id);


--
-- Name: rendez_vous_date_heure_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_date_heure_index ON public.rendez_vous USING btree (date_heure);


--
-- Name: rendez_vous_paiements_date_paiement_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_paiements_date_paiement_index ON public.rendez_vous_paiements USING btree (date_paiement);


--
-- Name: rendez_vous_paiements_rendez_vous_id_type_paiement_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_paiements_rendez_vous_id_type_paiement_index ON public.rendez_vous_paiements USING btree (rendez_vous_id, type_paiement);


--
-- Name: rendez_vous_statut_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_statut_index ON public.rendez_vous USING btree (statut);


--
-- Name: rendez_vous_sync_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX rendez_vous_sync_status_index ON public.rendez_vous USING btree (sync_status);


--
-- Name: salons_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salons_is_active_index ON public.salons USING btree (is_active);


--
-- Name: salons_slug_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX salons_slug_index ON public.salons USING btree (slug);


--
-- Name: sessions_last_activity_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_last_activity_index ON public.sessions USING btree (last_activity);


--
-- Name: sessions_user_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX sessions_user_id_index ON public.sessions USING btree (user_id);


--
-- Name: transferts_stock_created_at_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transferts_stock_created_at_index ON public.transferts_stock USING btree (created_at);


--
-- Name: transferts_stock_type_transfert_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transferts_stock_type_transfert_index ON public.transferts_stock USING btree (type_transfert);


--
-- Name: transferts_stock_valide_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX transferts_stock_valide_index ON public.transferts_stock USING btree (valide);


--
-- Name: types_prestations_salon_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX types_prestations_salon_id_index ON public.types_prestations USING btree (salon_id);


--
-- Name: users_is_active_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_is_active_index ON public.users USING btree (is_active);


--
-- Name: users_role_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_role_index ON public.users USING btree (role);


--
-- Name: users_salaire_mensuel_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_salaire_mensuel_index ON public.users USING btree (salaire_mensuel);


--
-- Name: users_telephone_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_telephone_index ON public.users USING btree (telephone);


--
-- Name: ventes_client_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_client_id_index ON public.ventes USING btree (client_id);


--
-- Name: ventes_coiffeur_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_coiffeur_id_index ON public.ventes USING btree (coiffeur_id);


--
-- Name: ventes_date_vente_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_date_vente_index ON public.ventes USING btree (date_vente);


--
-- Name: ventes_details_type_article_prestation_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_details_type_article_prestation_id_index ON public.ventes_details USING btree (type_article, prestation_id);


--
-- Name: ventes_details_vente_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_details_vente_id_index ON public.ventes_details USING btree (vente_id);


--
-- Name: ventes_numero_facture_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_numero_facture_index ON public.ventes USING btree (numero_facture);


--
-- Name: ventes_paiements_vente_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_paiements_vente_id_index ON public.ventes_paiements USING btree (vente_id);


--
-- Name: ventes_statut_paiement_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_statut_paiement_index ON public.ventes USING btree (statut_paiement);


--
-- Name: ventes_sync_status_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_sync_status_index ON public.ventes USING btree (sync_status);


--
-- Name: ventes_type_vente_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_type_vente_index ON public.ventes USING btree (type_vente);


--
-- Name: ventes_vendeur_id_index; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ventes_vendeur_id_index ON public.ventes USING btree (vendeur_id);


--
-- Name: categorie_attribut categorie_attribut_attribut_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie_attribut
    ADD CONSTRAINT categorie_attribut_attribut_id_foreign FOREIGN KEY (attribut_id) REFERENCES public.attributs(id) ON DELETE CASCADE;


--
-- Name: categorie_attribut categorie_attribut_categorie_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.categorie_attribut
    ADD CONSTRAINT categorie_attribut_categorie_id_foreign FOREIGN KEY (categorie_id) REFERENCES public.categories(id) ON DELETE CASCADE;


--
-- Name: coiffeur_rendez_vous coiffeur_rendez_vous_rendez_vous_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coiffeur_rendez_vous
    ADD CONSTRAINT coiffeur_rendez_vous_rendez_vous_id_foreign FOREIGN KEY (rendez_vous_id) REFERENCES public.rendez_vous(id) ON DELETE CASCADE;


--
-- Name: coiffeur_rendez_vous coiffeur_rendez_vous_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.coiffeur_rendez_vous
    ADD CONSTRAINT coiffeur_rendez_vous_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: confection_attributs confection_attributs_attribut_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_attributs
    ADD CONSTRAINT confection_attributs_attribut_id_foreign FOREIGN KEY (attribut_id) REFERENCES public.attributs(id) ON DELETE CASCADE;


--
-- Name: confection_attributs confection_attributs_confection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_attributs
    ADD CONSTRAINT confection_attributs_confection_id_foreign FOREIGN KEY (confection_id) REFERENCES public.confections(id) ON DELETE CASCADE;


--
-- Name: confection_details confection_details_confection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_details
    ADD CONSTRAINT confection_details_confection_id_foreign FOREIGN KEY (confection_id) REFERENCES public.confections(id) ON DELETE CASCADE;


--
-- Name: confection_details confection_details_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confection_details
    ADD CONSTRAINT confection_details_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: confections confections_categorie_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections
    ADD CONSTRAINT confections_categorie_id_foreign FOREIGN KEY (categorie_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: confections confections_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections
    ADD CONSTRAINT confections_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: confections confections_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.confections
    ADD CONSTRAINT confections_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: depenses depenses_categorie_depense_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_categorie_depense_id_foreign FOREIGN KEY (categorie_depense_id) REFERENCES public.categories_depenses(id) ON DELETE SET NULL;


--
-- Name: depenses depenses_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.depenses
    ADD CONSTRAINT depenses_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: mouvements_stock mouvements_stock_confection_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_confection_id_foreign FOREIGN KEY (confection_id) REFERENCES public.confections(id) ON DELETE SET NULL;


--
-- Name: mouvements_stock mouvements_stock_transfert_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_transfert_id_foreign FOREIGN KEY (transfert_id) REFERENCES public.transferts_stock(id) ON DELETE SET NULL;


--
-- Name: mouvements_stock mouvements_stock_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: mouvements_stock mouvements_stock_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: mouvements_stock mouvements_stock_vente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.mouvements_stock
    ADD CONSTRAINT mouvements_stock_vente_id_foreign FOREIGN KEY (vente_id) REFERENCES public.ventes(id) ON DELETE SET NULL;


--
-- Name: notifications notifications_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: photos_clients photos_clients_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_clients
    ADD CONSTRAINT photos_clients_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: photos_clients photos_clients_rendez_vous_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_clients
    ADD CONSTRAINT photos_clients_rendez_vous_id_foreign FOREIGN KEY (rendez_vous_id) REFERENCES public.rendez_vous(id) ON DELETE SET NULL;


--
-- Name: photos_clients photos_clients_vente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photos_clients
    ADD CONSTRAINT photos_clients_vente_id_foreign FOREIGN KEY (vente_id) REFERENCES public.ventes(id) ON DELETE SET NULL;


--
-- Name: pointages pointages_pointeur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pointages
    ADD CONSTRAINT pointages_pointeur_id_foreign FOREIGN KEY (pointeur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: pointages pointages_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pointages
    ADD CONSTRAINT pointages_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: prestations_clients prestations_clients_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients
    ADD CONSTRAINT prestations_clients_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: prestations_clients prestations_clients_coiffeur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients
    ADD CONSTRAINT prestations_clients_coiffeur_id_foreign FOREIGN KEY (coiffeur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: prestations_clients prestations_clients_type_prestation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients
    ADD CONSTRAINT prestations_clients_type_prestation_id_foreign FOREIGN KEY (type_prestation_id) REFERENCES public.types_prestations(id) ON DELETE RESTRICT;


--
-- Name: prestations_clients prestations_clients_vente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.prestations_clients
    ADD CONSTRAINT prestations_clients_vente_id_foreign FOREIGN KEY (vente_id) REFERENCES public.ventes(id) ON DELETE CASCADE;


--
-- Name: produit_attribut_valeurs produit_attribut_valeurs_attribut_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_attribut_valeurs
    ADD CONSTRAINT produit_attribut_valeurs_attribut_id_foreign FOREIGN KEY (attribut_id) REFERENCES public.attributs(id) ON DELETE CASCADE;


--
-- Name: produit_attribut_valeurs produit_attribut_valeurs_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_attribut_valeurs
    ADD CONSTRAINT produit_attribut_valeurs_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: produit_variantes produit_variantes_cree_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes
    ADD CONSTRAINT produit_variantes_cree_par_foreign FOREIGN KEY (cree_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: produit_variantes produit_variantes_produit_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes
    ADD CONSTRAINT produit_variantes_produit_id_foreign FOREIGN KEY (produit_id) REFERENCES public.produits(id) ON DELETE CASCADE;


--
-- Name: produit_variantes produit_variantes_valide_par_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produit_variantes
    ADD CONSTRAINT produit_variantes_valide_par_foreign FOREIGN KEY (valide_par) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: produits produits_categorie_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_categorie_id_foreign FOREIGN KEY (categorie_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: produits produits_salon_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.produits
    ADD CONSTRAINT produits_salon_id_foreign FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: rendez_vous rendez_vous_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous
    ADD CONSTRAINT rendez_vous_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;


--
-- Name: rendez_vous rendez_vous_coiffeur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous
    ADD CONSTRAINT rendez_vous_coiffeur_id_foreign FOREIGN KEY (coiffeur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: rendez_vous_paiements rendez_vous_paiements_rendez_vous_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_paiements
    ADD CONSTRAINT rendez_vous_paiements_rendez_vous_id_foreign FOREIGN KEY (rendez_vous_id) REFERENCES public.rendez_vous(id) ON DELETE CASCADE;


--
-- Name: rendez_vous_paiements rendez_vous_paiements_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_paiements
    ADD CONSTRAINT rendez_vous_paiements_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: rendez_vous_prestations rendez_vous_prestations_rendez_vous_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_prestations
    ADD CONSTRAINT rendez_vous_prestations_rendez_vous_id_foreign FOREIGN KEY (rendez_vous_id) REFERENCES public.rendez_vous(id) ON DELETE CASCADE;


--
-- Name: rendez_vous_prestations rendez_vous_prestations_type_prestation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.rendez_vous_prestations
    ADD CONSTRAINT rendez_vous_prestations_type_prestation_id_foreign FOREIGN KEY (type_prestation_id) REFERENCES public.types_prestations(id) ON DELETE CASCADE;


--
-- Name: transferts_stock transferts_stock_user_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock
    ADD CONSTRAINT transferts_stock_user_id_foreign FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: transferts_stock transferts_stock_valideur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock
    ADD CONSTRAINT transferts_stock_valideur_id_foreign FOREIGN KEY (valideur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: transferts_stock transferts_stock_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.transferts_stock
    ADD CONSTRAINT transferts_stock_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: types_prestations types_prestations_salon_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.types_prestations
    ADD CONSTRAINT types_prestations_salon_id_foreign FOREIGN KEY (salon_id) REFERENCES public.salons(id) ON DELETE CASCADE;


--
-- Name: ventes ventes_client_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_client_id_foreign FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL;


--
-- Name: ventes ventes_coiffeur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_coiffeur_id_foreign FOREIGN KEY (coiffeur_id) REFERENCES public.users(id) ON DELETE SET NULL;


--
-- Name: ventes_details ventes_details_prestation_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_details
    ADD CONSTRAINT ventes_details_prestation_id_foreign FOREIGN KEY (prestation_id) REFERENCES public.types_prestations(id) ON DELETE SET NULL;


--
-- Name: ventes_details ventes_details_variante_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_details
    ADD CONSTRAINT ventes_details_variante_id_foreign FOREIGN KEY (variante_id) REFERENCES public.produit_variantes(id) ON DELETE SET NULL;


--
-- Name: ventes_details ventes_details_vente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_details
    ADD CONSTRAINT ventes_details_vente_id_foreign FOREIGN KEY (vente_id) REFERENCES public.ventes(id) ON DELETE CASCADE;


--
-- Name: ventes_paiements ventes_paiements_vente_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes_paiements
    ADD CONSTRAINT ventes_paiements_vente_id_foreign FOREIGN KEY (vente_id) REFERENCES public.ventes(id) ON DELETE CASCADE;


--
-- Name: ventes ventes_rendez_vous_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_rendez_vous_id_foreign FOREIGN KEY (rendez_vous_id) REFERENCES public.rendez_vous(id) ON DELETE SET NULL;


--
-- Name: ventes ventes_vendeur_id_foreign; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ventes
    ADD CONSTRAINT ventes_vendeur_id_foreign FOREIGN KEY (vendeur_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict aae0Hh7ZZj2wqu0J7ix2mGyF9i6Mei4A3u5uGShMLUp4hbIdhMUA8sFCsb7IaH3

--
-- PostgreSQL database dump
--

\restrict 9Ivsgwfus7PYlntfG6w8IKm2Uz2d8zpcyffRNb5w8dsXrUA4a3cyyCosvurI69k

-- Dumped from database version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)
-- Dumped by pg_dump version 16.13 (Ubuntu 16.13-0ubuntu0.24.04.1)

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
-- Data for Name: migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.migrations (id, migration, batch) FROM stdin;
1	0001_01_01_000000_create_users_table	1
2	0001_01_01_000001_create_cache_table	1
3	0001_01_01_000002_create_jobs_table	1
4	0001_01_01_00003_create_categories_table	1
5	0001_01_01_00004_create_produits_table	1
6	2026_01_22_163358_create_personal_access_tokens_table	1
7	2026_01_22_182234_create_clients_table	1
8	2026_01_22_184046_create_type_prestations_table	1
9	2026_01_22_184627_create_rendez_vous_table	1
10	2026_01_22_185122_create_ventes_and_details_table	1
11	2026_01_22_185307_create_mouvements_and_photos_table	1
12	2026_01_23_163946_create_sessions_table	1
13	2026_01_23_190830_rename_code_pin_to_password_in_users_table	1
14	2026_01_24_151519_create_pointages_table	1
15	2026_01_24_151640_create_attributs_table	1
16	2026_01_24_151733_create_confections_table	1
17	2026_01_24_151848_add_stock_separation_to_produits_table	1
18	2026_01_24_152005_create_transferts_stock_table	1
19	2026_01_24_152050_create_prestations_clients_table	1
20	2026_01_24_152135_add_stock_type_to_mouvements_stock_table	1
21	2026_01_28_164217_create_depenses_table	1
22	2026_01_29_093238_add_destination_and_produit_to_confection_table	1
23	2026_01_29_214335_create_salon_table	1
24	2026_01_30_001756_create_notifications_table	1
25	2026_01_30_220814_add_salaire_to_users_table	1
26	2026_01_31_003848_add_public_visibility_to_produits_table	1
27	2026_01_31_003958_add_slug_to_salons_table	1
28	2026_01_31_013355_add_is_active_to_salons_table	1
29	2026_01_31_014002_add_salon_id_to_types_prestations_table	1
30	2026_01_31_014047_add_salon_id_to_produits_table	1
31	2026_01_31_151432_add_acompte_to_types_prestations_table	1
32	2026_02_02_001618_make_seuils_nullable_in_produits_table	1
33	2026_02_03_184808_make_client_nom_prenom_nullable	2
34	2026_02_04_015050_create_coiffeur_rendez_vous_table	3
35	2026_02_04_024640_add_new_elements_to_produits_table	4
36	2026_02_04_171733_add_stock_reserve_to_produits_table	5
37	2026_02_04_190849_update_type_stock_principal_constraint	6
38	2026_02_04_193136_update_transferts_stock_type_transfert_constraint	7
39	2026_02_04_193424_update_mouvements_stock_type_stock_constraint	8
40	2026_02_05_092518_add_missing_devise_fields_to_produits_table	9
41	2026_02_06_182935_add_new_elements_to_table_produits	10
42	2026_02_09_111111_create_rebdez_vous_paiements_table	11
43	2026_02_10_104330_create_rendez_vous_prestations_table	12
44	2026_02_10_110749_remove_type_prestation_id_from_rendez_vous_table	13
45	2026_02_20_111954_add_validation_to_produits_table	14
46	2026_03_05_172615_create_produit_variantes_table	15
47	2026_03_05_172905_migrate_produits_to_variantes	15
48	2026_03_05_173054_cleanup_after_variantes_migration	15
49	2026_03_06_175306_create_categories_depenses_table	16
50	2026_03_06_175442_update_depenses_add_categorie_id	16
\.


--
-- Name: migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.migrations_id_seq', 50, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 9Ivsgwfus7PYlntfG6w8IKm2Uz2d8zpcyffRNb5w8dsXrUA4a3cyyCosvurI69k

