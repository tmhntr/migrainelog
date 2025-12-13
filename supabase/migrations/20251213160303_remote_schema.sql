


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."trigger_set_timestamp"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_set_timestamp"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_pain_location"("locations" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
  valid_locations TEXT[] := ARRAY[
    'forehead', 'temples', 'back_of_head', 'top_of_head',
    'left_side', 'right_side', 'eyes', 'jaw', 'neck'
  ];
  location TEXT;
BEGIN
  FOREACH location IN ARRAY locations
  LOOP
    IF NOT (location = ANY(valid_locations)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_pain_location"("locations" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_symptoms"("symptom_list" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
  valid_symptoms TEXT[] := ARRAY[
    'nausea', 'vomiting', 'light_sensitivity', 'sound_sensitivity',
    'smell_sensitivity', 'visual_disturbances', 'aura', 'dizziness',
    'fatigue', 'confusion', 'irritability'
  ];
  symptom TEXT;
BEGIN
  FOREACH symptom IN ARRAY symptom_list
  LOOP
    IF NOT (symptom = ANY(valid_symptoms)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_symptoms"("symptom_list" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_triggers"("trigger_list" "text"[]) RETURNS boolean
    LANGUAGE "plpgsql" IMMUTABLE
    AS $$
DECLARE
  valid_triggers TEXT[] := ARRAY[
    'stress', 'lack_of_sleep', 'weather_change', 'bright_lights',
    'loud_noises', 'strong_smells', 'alcohol', 'caffeine',
    'dehydration', 'skipped_meal', 'hormonal_changes', 'exercise',
    'screen_time'
  ];
  trigger_item TEXT;
BEGIN
  FOREACH trigger_item IN ARRAY trigger_list
  LOOP
    IF NOT (trigger_item = ANY(valid_triggers)) THEN
      RETURN FALSE;
    END IF;
  END LOOP;
  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."validate_triggers"("trigger_list" "text"[]) OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."episodes" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "start_time" timestamp with time zone NOT NULL,
    "end_time" timestamp with time zone,
    "severity" integer NOT NULL,
    "pain_location" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "symptoms" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "triggers" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "medications" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "episodes_severity_check" CHECK ((("severity" >= 1) AND ("severity" <= 10))),
    CONSTRAINT "valid_severity" CHECK ((("severity" >= 1) AND ("severity" <= 10))),
    CONSTRAINT "valid_time_range" CHECK ((("end_time" IS NULL) OR ("end_time" >= "start_time")))
);


ALTER TABLE "public"."episodes" OWNER TO "postgres";


COMMENT ON TABLE "public"."episodes" IS 'Stores migraine episode data for users';



COMMENT ON COLUMN "public"."episodes"."id" IS 'Unique identifier for the episode';



COMMENT ON COLUMN "public"."episodes"."user_id" IS 'Reference to the user who owns this episode';



COMMENT ON COLUMN "public"."episodes"."start_time" IS 'When the migraine episode started';



COMMENT ON COLUMN "public"."episodes"."end_time" IS 'When the migraine episode ended (null if ongoing)';



COMMENT ON COLUMN "public"."episodes"."severity" IS 'Pain severity on a scale of 1-10';



COMMENT ON COLUMN "public"."episodes"."pain_location" IS 'Array of pain locations (e.g., forehead, temples)';



COMMENT ON COLUMN "public"."episodes"."symptoms" IS 'Array of symptoms experienced';



COMMENT ON COLUMN "public"."episodes"."triggers" IS 'Array of potential triggers identified';



COMMENT ON COLUMN "public"."episodes"."medications" IS 'JSONB array of medications taken with details';



COMMENT ON COLUMN "public"."episodes"."notes" IS 'Additional notes about the episode';



COMMENT ON COLUMN "public"."episodes"."created_at" IS 'Timestamp when the record was created';



COMMENT ON COLUMN "public"."episodes"."updated_at" IS 'Timestamp when the record was last updated';



CREATE OR REPLACE VIEW "public"."episode_stats" WITH ("security_invoker"='true') AS
 SELECT "user_id",
    "count"(*) AS "total_episodes",
    "round"("avg"("severity"), 2) AS "average_severity",
    "round"("avg"((EXTRACT(epoch FROM ("end_time" - "start_time")) / (3600)::numeric)), 2) AS "average_duration_hours",
    "min"("start_time") AS "first_episode",
    "max"("start_time") AS "latest_episode"
   FROM "public"."episodes"
  WHERE ("end_time" IS NOT NULL)
  GROUP BY "user_id";


ALTER VIEW "public"."episode_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."episodes"
    ADD CONSTRAINT "episodes_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_episodes_medications" ON "public"."episodes" USING "gin" ("medications");



CREATE INDEX "idx_episodes_pain_location" ON "public"."episodes" USING "gin" ("pain_location");



CREATE INDEX "idx_episodes_severity" ON "public"."episodes" USING "btree" ("severity");



CREATE INDEX "idx_episodes_start_time" ON "public"."episodes" USING "btree" ("start_time" DESC);



CREATE INDEX "idx_episodes_symptoms" ON "public"."episodes" USING "gin" ("symptoms");



CREATE INDEX "idx_episodes_triggers" ON "public"."episodes" USING "gin" ("triggers");



CREATE INDEX "idx_episodes_user_id" ON "public"."episodes" USING "btree" ("user_id");



CREATE INDEX "idx_episodes_user_severity_time" ON "public"."episodes" USING "btree" ("user_id", "severity", "start_time" DESC);



CREATE INDEX "idx_episodes_user_start_time" ON "public"."episodes" USING "btree" ("user_id", "start_time" DESC);



CREATE OR REPLACE TRIGGER "set_timestamp" BEFORE UPDATE ON "public"."episodes" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_set_timestamp"();



ALTER TABLE ONLY "public"."episodes"
    ADD CONSTRAINT "episodes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "Users can delete their own episodes" ON "public"."episodes" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own episodes" ON "public"."episodes" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own episodes" ON "public"."episodes" FOR UPDATE USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own episodes" ON "public"."episodes" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."episodes" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_set_timestamp"() TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_pain_location"("locations" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_pain_location"("locations" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_pain_location"("locations" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_symptoms"("symptom_list" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_symptoms"("symptom_list" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_symptoms"("symptom_list" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_triggers"("trigger_list" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."validate_triggers"("trigger_list" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_triggers"("trigger_list" "text"[]) TO "service_role";


















GRANT ALL ON TABLE "public"."episodes" TO "anon";
GRANT ALL ON TABLE "public"."episodes" TO "authenticated";
GRANT ALL ON TABLE "public"."episodes" TO "service_role";



GRANT ALL ON TABLE "public"."episode_stats" TO "anon";
GRANT ALL ON TABLE "public"."episode_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."episode_stats" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































