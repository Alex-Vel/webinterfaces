-- Database: web_interfaces_test

-- DROP DATABASE web_interfaces_test;

CREATE DATABASE web_interfaces_test
    WITH 
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'English_United States.1252'
    LC_CTYPE = 'English_United States.1252'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

-- public.users definition

-- Drop table

-- DROP TABLE users;

CREATE TABLE users (
	user_id serial NOT NULL,
	username varchar(60) NOT NULL,
	email varchar(254) NOT NULL,
	user_config jsonb NULL,
	"location" varchar(60) NOT NULL,
	"password" varchar(100) NOT NULL,
	birth_date varchar(60) NOT NULL,
	create_date timestamptz(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT users_pk PRIMARY KEY (user_id)
);

-- public.postings definition

-- Drop table

-- DROP TABLE postings;

CREATE TABLE postings (
	posting_id serial NOT NULL,
	title varchar(90) NOT NULL,
	description varchar(5000) NULL,
	create_date timestamptz(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,
	posting_config jsonb NULL,
	"location" varchar(60) NOT NULL,
	category varchar(60) NOT NULL,
	user_id int4 NOT NULL,
	price float4 NULL,
	shipping_method varchar(44) NULL,
	uuid varchar(99) NULL,
	image_links jsonb NULL,
	CONSTRAINT postings_pk PRIMARY KEY (posting_id)
);


-- public.postings foreign keys

ALTER TABLE public.postings ADD CONSTRAINT postings_fk FOREIGN KEY (user_id) REFERENCES users(user_id) ON UPDATE CASCADE ON DELETE CASCADE;
