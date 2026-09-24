import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_hero_full_ctas_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_pages_blocks_hero_full_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_hero_full_text_position" AS ENUM('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right');
  CREATE TYPE "public"."enum_pages_blocks_hero_full_text_color" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum_pages_blocks_hero_split_panels_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_pages_blocks_hero_split_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_product_rail_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_product_rail_source" AS ENUM('collection', 'category', 'manual', 'new', 'sale');
  CREATE TYPE "public"."enum_pages_blocks_editorial_two_up_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_editorial_two_up_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_pages_blocks_category_tiles_tiles_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_pages_blocks_category_tiles_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_text_banner_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_blocks_text_banner_tone" AS ENUM('ink', 'paper', 'accent');
  CREATE TYPE "public"."enum_pages_blocks_text_banner_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_pages_blocks_usp_strip_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum_pages_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_full_ctas_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_full_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_full_text_position" AS ENUM('top-left', 'top-center', 'top-right', 'middle-left', 'middle-center', 'middle-right', 'bottom-left', 'bottom-center', 'bottom-right');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_full_text_color" AS ENUM('light', 'dark');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_split_panels_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_hero_split_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_product_rail_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_product_rail_source" AS ENUM('collection', 'category', 'manual', 'new', 'sale');
  CREATE TYPE "public"."enum__pages_v_blocks_editorial_two_up_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_editorial_two_up_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_category_tiles_tiles_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_category_tiles_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_text_banner_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_blocks_text_banner_tone" AS ENUM('ink', 'paper', 'accent');
  CREATE TYPE "public"."enum__pages_v_blocks_text_banner_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum__pages_v_blocks_usp_strip_visibility_devices" AS ENUM('desktop', 'mobile');
  CREATE TYPE "public"."enum__pages_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_themes_tokens_radius" AS ENUM('0px', '2px');
  CREATE TYPE "public"."enum_themes_tokens_font_display" AS ENUM('grotesque', 'serif');
  CREATE TYPE "public"."enum_themes_tokens_type_scale" AS ENUM('compact', 'regular', 'editorial');
  CREATE TYPE "public"."enum_menus_items_children_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_menus_items_link_type" AS ENUM('category', 'collection', 'product', 'page', 'external');
  CREATE TYPE "public"."enum_menus_location" AS ENUM('header', 'footer');
  CREATE TYPE "public"."enum_media_usage" AS ENUM('product', 'hero', 'editorial');
  CREATE TYPE "public"."enum_users_role" AS ENUM('owner', 'content');
  CREATE TYPE "public"."enum_payload_jobs_log_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TYPE "public"."enum_payload_jobs_log_state" AS ENUM('failed', 'succeeded');
  CREATE TYPE "public"."enum_payload_jobs_task_slug" AS ENUM('inline', 'schedulePublish');
  CREATE TABLE "pages_blocks_hero_full_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_type" "enum_pages_blocks_hero_full_ctas_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_full_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_hero_full_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_full" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_desktop_id" integer,
  	"image_mobile_id" integer,
  	"heading" varchar,
  	"subheading" varchar,
  	"text_position" "enum_pages_blocks_hero_full_text_position" DEFAULT 'bottom-left',
  	"text_color" "enum_pages_blocks_hero_full_text_color" DEFAULT 'light',
  	"overlay" numeric DEFAULT 0,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_split_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"link_type" "enum_pages_blocks_hero_split_panels_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_hero_split_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_hero_split_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_hero_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_product_rail_product_handles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"handle" varchar
  );
  
  CREATE TABLE "pages_blocks_product_rail_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_product_rail_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_product_rail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum_pages_blocks_product_rail_source" DEFAULT 'collection',
  	"handle" varchar,
  	"limit" numeric DEFAULT 8,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_editorial_two_up_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_editorial_two_up_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_editorial_two_up" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_left_id" integer,
  	"image_right_id" integer,
  	"heading" varchar,
  	"body" varchar,
  	"link_type" "enum_pages_blocks_editorial_two_up_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_category_tiles_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"link_type" "enum_pages_blocks_category_tiles_tiles_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "pages_blocks_category_tiles_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_category_tiles_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_category_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_text_banner_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_text_banner_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_text_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"tone" "enum_pages_blocks_text_banner_tone" DEFAULT 'ink',
  	"link_type" "enum_pages_blocks_text_banner_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_usp_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar
  );
  
  CREATE TABLE "pages_blocks_usp_strip_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" varchar NOT NULL,
  	"value" "enum_pages_blocks_usp_strip_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "pages_blocks_usp_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"slug" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_canonical" varchar,
  	"seo_og_image_id" integer,
  	"seo_noindex" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_pages_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_pages_v_blocks_hero_full_ctas" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_type" "enum__pages_v_blocks_hero_full_ctas_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_full_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_hero_full_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_full" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_desktop_id" integer,
  	"image_mobile_id" integer,
  	"heading" varchar,
  	"subheading" varchar,
  	"text_position" "enum__pages_v_blocks_hero_full_text_position" DEFAULT 'bottom-left',
  	"text_color" "enum__pages_v_blocks_hero_full_text_color" DEFAULT 'light',
  	"overlay" numeric DEFAULT 0,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_split_panels" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"heading" varchar,
  	"link_type" "enum__pages_v_blocks_hero_split_panels_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_hero_split_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_hero_split_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_hero_split" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_rail_product_handles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"handle" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_product_rail_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_product_rail_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_product_rail" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"source" "enum__pages_v_blocks_product_rail_source" DEFAULT 'collection',
  	"handle" varchar,
  	"limit" numeric DEFAULT 8,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_editorial_two_up_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_editorial_two_up_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_editorial_two_up" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_left_id" integer,
  	"image_right_id" integer,
  	"heading" varchar,
  	"body" varchar,
  	"link_type" "enum__pages_v_blocks_editorial_two_up_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_tiles_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"link_type" "enum__pages_v_blocks_category_tiles_tiles_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_tiles_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_category_tiles_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_category_tiles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_text_banner_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_text_banner_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_text_banner" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"tone" "enum__pages_v_blocks_text_banner_tone" DEFAULT 'ink',
  	"link_type" "enum__pages_v_blocks_text_banner_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_usp_strip_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"body" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_usp_strip_visibility_devices" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__pages_v_blocks_usp_strip_visibility_devices",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_pages_v_blocks_usp_strip" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"visibility_from" timestamp(3) with time zone,
  	"visibility_to" timestamp(3) with time zone,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_slug" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_canonical" varchar,
  	"version_seo_og_image_id" integer,
  	"version_seo_noindex" boolean DEFAULT false,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__pages_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean,
  	"autosave" boolean
  );
  
  CREATE TABLE "themes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"active_from" timestamp(3) with time zone NOT NULL,
  	"active_to" timestamp(3) with time zone,
  	"tokens_ink" varchar DEFAULT '#17141B' NOT NULL,
  	"tokens_paper" varchar DEFAULT '#FBFAFC' NOT NULL,
  	"tokens_accent" varchar DEFAULT '#7C3E56' NOT NULL,
  	"tokens_muted" varchar DEFAULT '#6B6474' NOT NULL,
  	"tokens_sale" varchar DEFAULT '#9B3B33' NOT NULL,
  	"tokens_rule" varchar DEFAULT '#E2DDE7' NOT NULL,
  	"tokens_radius" "enum_themes_tokens_radius" DEFAULT '0px',
  	"tokens_font_display" "enum_themes_tokens_font_display" DEFAULT 'grotesque',
  	"tokens_type_scale" "enum_themes_tokens_type_scale" DEFAULT 'regular',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "menus_items_children" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_menus_items_children_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar
  );
  
  CREATE TABLE "menus_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"link_type" "enum_menus_items_link_type" DEFAULT 'category',
  	"link_handle" varchar,
  	"link_page_id" integer,
  	"link_url" varchar,
  	"link_label" varchar,
  	"featured_image_id" integer
  );
  
  CREATE TABLE "menus" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"location" "enum_menus_location" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"usage" "enum_media_usage" DEFAULT 'product',
  	"credit" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_product_url" varchar,
  	"sizes_product_width" numeric,
  	"sizes_product_height" numeric,
  	"sizes_product_mime_type" varchar,
  	"sizes_product_filesize" numeric,
  	"sizes_product_filename" varchar,
  	"sizes_hero_url" varchar,
  	"sizes_hero_width" numeric,
  	"sizes_hero_height" numeric,
  	"sizes_hero_mime_type" varchar,
  	"sizes_hero_filesize" numeric,
  	"sizes_hero_filename" varchar,
  	"sizes_hero_mobile_url" varchar,
  	"sizes_hero_mobile_width" numeric,
  	"sizes_hero_mobile_height" numeric,
  	"sizes_hero_mobile_mime_type" varchar,
  	"sizes_hero_mobile_filesize" numeric,
  	"sizes_hero_mobile_filename" varchar
  );
  
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"role" "enum_users_role" DEFAULT 'content' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_jobs_log" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"executed_at" timestamp(3) with time zone NOT NULL,
  	"completed_at" timestamp(3) with time zone NOT NULL,
  	"task_slug" "enum_payload_jobs_log_task_slug" NOT NULL,
  	"task_i_d" varchar NOT NULL,
  	"input" jsonb,
  	"output" jsonb,
  	"state" "enum_payload_jobs_log_state" NOT NULL,
  	"error" jsonb
  );
  
  CREATE TABLE "payload_jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"input" jsonb,
  	"completed_at" timestamp(3) with time zone,
  	"total_tried" numeric DEFAULT 0,
  	"has_error" boolean DEFAULT false,
  	"error" jsonb,
  	"task_slug" "enum_payload_jobs_task_slug",
  	"queue" varchar DEFAULT 'default',
  	"wait_until" timestamp(3) with time zone,
  	"processing" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"pages_id" integer,
  	"themes_id" integer,
  	"menus_id" integer,
  	"media_id" integer,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "pages_blocks_hero_full_ctas" ADD CONSTRAINT "pages_blocks_hero_full_ctas_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_full_ctas" ADD CONSTRAINT "pages_blocks_hero_full_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_full"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_full_visibility_devices" ADD CONSTRAINT "pages_blocks_hero_full_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_hero_full"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_full" ADD CONSTRAINT "pages_blocks_hero_full_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_full" ADD CONSTRAINT "pages_blocks_hero_full_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_full" ADD CONSTRAINT "pages_blocks_hero_full_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_split_panels" ADD CONSTRAINT "pages_blocks_hero_split_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_split_panels" ADD CONSTRAINT "pages_blocks_hero_split_panels_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_split_panels" ADD CONSTRAINT "pages_blocks_hero_split_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_split_visibility_devices" ADD CONSTRAINT "pages_blocks_hero_split_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_hero_split" ADD CONSTRAINT "pages_blocks_hero_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_rail_product_handles" ADD CONSTRAINT "pages_blocks_product_rail_product_handles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_product_rail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_rail_visibility_devices" ADD CONSTRAINT "pages_blocks_product_rail_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_product_rail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_product_rail" ADD CONSTRAINT "pages_blocks_product_rail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_editorial_two_up_visibility_devices" ADD CONSTRAINT "pages_blocks_editorial_two_up_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_editorial_two_up"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_editorial_two_up" ADD CONSTRAINT "pages_blocks_editorial_two_up_image_left_id_media_id_fk" FOREIGN KEY ("image_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_editorial_two_up" ADD CONSTRAINT "pages_blocks_editorial_two_up_image_right_id_media_id_fk" FOREIGN KEY ("image_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_editorial_two_up" ADD CONSTRAINT "pages_blocks_editorial_two_up_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_editorial_two_up" ADD CONSTRAINT "pages_blocks_editorial_two_up_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_tiles_tiles" ADD CONSTRAINT "pages_blocks_category_tiles_tiles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_tiles_tiles" ADD CONSTRAINT "pages_blocks_category_tiles_tiles_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_tiles_tiles" ADD CONSTRAINT "pages_blocks_category_tiles_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_category_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_tiles_visibility_devices" ADD CONSTRAINT "pages_blocks_category_tiles_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_category_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_tiles" ADD CONSTRAINT "pages_blocks_category_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_banner_visibility_devices" ADD CONSTRAINT "pages_blocks_text_banner_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_text_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_banner" ADD CONSTRAINT "pages_blocks_text_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_text_banner" ADD CONSTRAINT "pages_blocks_text_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_usp_strip_items" ADD CONSTRAINT "pages_blocks_usp_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_usp_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_usp_strip_visibility_devices" ADD CONSTRAINT "pages_blocks_usp_strip_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages_blocks_usp_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_usp_strip" ADD CONSTRAINT "pages_blocks_usp_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages" ADD CONSTRAINT "pages_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_full_ctas_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full_ctas" ADD CONSTRAINT "_pages_v_blocks_hero_full_ctas_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_full"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_hero_full_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_hero_full"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full" ADD CONSTRAINT "_pages_v_blocks_hero_full_image_desktop_id_media_id_fk" FOREIGN KEY ("image_desktop_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full" ADD CONSTRAINT "_pages_v_blocks_hero_full_image_mobile_id_media_id_fk" FOREIGN KEY ("image_mobile_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_full" ADD CONSTRAINT "_pages_v_blocks_hero_full_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_split_panels" ADD CONSTRAINT "_pages_v_blocks_hero_split_panels_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_split_panels" ADD CONSTRAINT "_pages_v_blocks_hero_split_panels_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_split_panels" ADD CONSTRAINT "_pages_v_blocks_hero_split_panels_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_split_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_hero_split_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_hero_split"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_hero_split" ADD CONSTRAINT "_pages_v_blocks_hero_split_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_rail_product_handles" ADD CONSTRAINT "_pages_v_blocks_product_rail_product_handles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_product_rail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_rail_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_product_rail_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_product_rail"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_product_rail" ADD CONSTRAINT "_pages_v_blocks_product_rail_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_editorial_two_up_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_editorial_two_up_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_editorial_two_up"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_editorial_two_up" ADD CONSTRAINT "_pages_v_blocks_editorial_two_up_image_left_id_media_id_fk" FOREIGN KEY ("image_left_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_editorial_two_up" ADD CONSTRAINT "_pages_v_blocks_editorial_two_up_image_right_id_media_id_fk" FOREIGN KEY ("image_right_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_editorial_two_up" ADD CONSTRAINT "_pages_v_blocks_editorial_two_up_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_editorial_two_up" ADD CONSTRAINT "_pages_v_blocks_editorial_two_up_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_tiles_tiles" ADD CONSTRAINT "_pages_v_blocks_category_tiles_tiles_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_tiles_tiles" ADD CONSTRAINT "_pages_v_blocks_category_tiles_tiles_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_tiles_tiles" ADD CONSTRAINT "_pages_v_blocks_category_tiles_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_category_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_tiles_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_category_tiles_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_category_tiles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_tiles" ADD CONSTRAINT "_pages_v_blocks_category_tiles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_banner_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_text_banner_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_text_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_banner" ADD CONSTRAINT "_pages_v_blocks_text_banner_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_text_banner" ADD CONSTRAINT "_pages_v_blocks_text_banner_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_usp_strip_items" ADD CONSTRAINT "_pages_v_blocks_usp_strip_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_usp_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_usp_strip_visibility_devices" ADD CONSTRAINT "_pages_v_blocks_usp_strip_visibility_devices_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_pages_v_blocks_usp_strip"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_usp_strip" ADD CONSTRAINT "_pages_v_blocks_usp_strip_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_parent_id_pages_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v" ADD CONSTRAINT "_pages_v_version_seo_og_image_id_media_id_fk" FOREIGN KEY ("version_seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_items_children" ADD CONSTRAINT "menus_items_children_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_items_children" ADD CONSTRAINT "menus_items_children_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus_items"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "menus_items" ADD CONSTRAINT "menus_items_link_page_id_pages_id_fk" FOREIGN KEY ("link_page_id") REFERENCES "public"."pages"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_items" ADD CONSTRAINT "menus_items_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "menus_items" ADD CONSTRAINT "menus_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_jobs_log" ADD CONSTRAINT "payload_jobs_log_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."payload_jobs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_themes_fk" FOREIGN KEY ("themes_id") REFERENCES "public"."themes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_menus_fk" FOREIGN KEY ("menus_id") REFERENCES "public"."menus"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_hero_full_ctas_order_idx" ON "pages_blocks_hero_full_ctas" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_full_ctas_parent_id_idx" ON "pages_blocks_hero_full_ctas" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_full_ctas_link_link_page_idx" ON "pages_blocks_hero_full_ctas" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_hero_full_visibility_devices_order_idx" ON "pages_blocks_hero_full_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_hero_full_visibility_devices_parent_idx" ON "pages_blocks_hero_full_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_hero_full_order_idx" ON "pages_blocks_hero_full" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_full_parent_id_idx" ON "pages_blocks_hero_full" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_full_path_idx" ON "pages_blocks_hero_full" USING btree ("_path");
  CREATE INDEX "pages_blocks_hero_full_image_desktop_idx" ON "pages_blocks_hero_full" USING btree ("image_desktop_id");
  CREATE INDEX "pages_blocks_hero_full_image_mobile_idx" ON "pages_blocks_hero_full" USING btree ("image_mobile_id");
  CREATE INDEX "pages_blocks_hero_split_panels_order_idx" ON "pages_blocks_hero_split_panels" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_split_panels_parent_id_idx" ON "pages_blocks_hero_split_panels" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_split_panels_image_idx" ON "pages_blocks_hero_split_panels" USING btree ("image_id");
  CREATE INDEX "pages_blocks_hero_split_panels_link_link_page_idx" ON "pages_blocks_hero_split_panels" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_hero_split_visibility_devices_order_idx" ON "pages_blocks_hero_split_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_hero_split_visibility_devices_parent_idx" ON "pages_blocks_hero_split_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_hero_split_order_idx" ON "pages_blocks_hero_split" USING btree ("_order");
  CREATE INDEX "pages_blocks_hero_split_parent_id_idx" ON "pages_blocks_hero_split" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_hero_split_path_idx" ON "pages_blocks_hero_split" USING btree ("_path");
  CREATE INDEX "pages_blocks_product_rail_product_handles_order_idx" ON "pages_blocks_product_rail_product_handles" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_rail_product_handles_parent_id_idx" ON "pages_blocks_product_rail_product_handles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_rail_visibility_devices_order_idx" ON "pages_blocks_product_rail_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_product_rail_visibility_devices_parent_idx" ON "pages_blocks_product_rail_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_product_rail_order_idx" ON "pages_blocks_product_rail" USING btree ("_order");
  CREATE INDEX "pages_blocks_product_rail_parent_id_idx" ON "pages_blocks_product_rail" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_product_rail_path_idx" ON "pages_blocks_product_rail" USING btree ("_path");
  CREATE INDEX "pages_blocks_editorial_two_up_visibility_devices_order_idx" ON "pages_blocks_editorial_two_up_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_editorial_two_up_visibility_devices_parent_idx" ON "pages_blocks_editorial_two_up_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_editorial_two_up_order_idx" ON "pages_blocks_editorial_two_up" USING btree ("_order");
  CREATE INDEX "pages_blocks_editorial_two_up_parent_id_idx" ON "pages_blocks_editorial_two_up" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_editorial_two_up_path_idx" ON "pages_blocks_editorial_two_up" USING btree ("_path");
  CREATE INDEX "pages_blocks_editorial_two_up_image_left_idx" ON "pages_blocks_editorial_two_up" USING btree ("image_left_id");
  CREATE INDEX "pages_blocks_editorial_two_up_image_right_idx" ON "pages_blocks_editorial_two_up" USING btree ("image_right_id");
  CREATE INDEX "pages_blocks_editorial_two_up_link_link_page_idx" ON "pages_blocks_editorial_two_up" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_category_tiles_tiles_order_idx" ON "pages_blocks_category_tiles_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_tiles_tiles_parent_id_idx" ON "pages_blocks_category_tiles_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_tiles_tiles_image_idx" ON "pages_blocks_category_tiles_tiles" USING btree ("image_id");
  CREATE INDEX "pages_blocks_category_tiles_tiles_link_link_page_idx" ON "pages_blocks_category_tiles_tiles" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_category_tiles_visibility_devices_order_idx" ON "pages_blocks_category_tiles_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_category_tiles_visibility_devices_parent_idx" ON "pages_blocks_category_tiles_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_category_tiles_order_idx" ON "pages_blocks_category_tiles" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_tiles_parent_id_idx" ON "pages_blocks_category_tiles" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_tiles_path_idx" ON "pages_blocks_category_tiles" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_banner_visibility_devices_order_idx" ON "pages_blocks_text_banner_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_text_banner_visibility_devices_parent_idx" ON "pages_blocks_text_banner_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_text_banner_order_idx" ON "pages_blocks_text_banner" USING btree ("_order");
  CREATE INDEX "pages_blocks_text_banner_parent_id_idx" ON "pages_blocks_text_banner" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_text_banner_path_idx" ON "pages_blocks_text_banner" USING btree ("_path");
  CREATE INDEX "pages_blocks_text_banner_link_link_page_idx" ON "pages_blocks_text_banner" USING btree ("link_page_id");
  CREATE INDEX "pages_blocks_usp_strip_items_order_idx" ON "pages_blocks_usp_strip_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_usp_strip_items_parent_id_idx" ON "pages_blocks_usp_strip_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_usp_strip_visibility_devices_order_idx" ON "pages_blocks_usp_strip_visibility_devices" USING btree ("order");
  CREATE INDEX "pages_blocks_usp_strip_visibility_devices_parent_idx" ON "pages_blocks_usp_strip_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "pages_blocks_usp_strip_order_idx" ON "pages_blocks_usp_strip" USING btree ("_order");
  CREATE INDEX "pages_blocks_usp_strip_parent_id_idx" ON "pages_blocks_usp_strip" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_usp_strip_path_idx" ON "pages_blocks_usp_strip" USING btree ("_path");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_seo_seo_og_image_idx" ON "pages" USING btree ("seo_og_image_id");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "pages__status_idx" ON "pages" USING btree ("_status");
  CREATE INDEX "_pages_v_blocks_hero_full_ctas_order_idx" ON "_pages_v_blocks_hero_full_ctas" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_full_ctas_parent_id_idx" ON "_pages_v_blocks_hero_full_ctas" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_full_ctas_link_link_page_idx" ON "_pages_v_blocks_hero_full_ctas" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_hero_full_visibility_devices_order_idx" ON "_pages_v_blocks_hero_full_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_hero_full_visibility_devices_parent_idx" ON "_pages_v_blocks_hero_full_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_hero_full_order_idx" ON "_pages_v_blocks_hero_full" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_full_parent_id_idx" ON "_pages_v_blocks_hero_full" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_full_path_idx" ON "_pages_v_blocks_hero_full" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_hero_full_image_desktop_idx" ON "_pages_v_blocks_hero_full" USING btree ("image_desktop_id");
  CREATE INDEX "_pages_v_blocks_hero_full_image_mobile_idx" ON "_pages_v_blocks_hero_full" USING btree ("image_mobile_id");
  CREATE INDEX "_pages_v_blocks_hero_split_panels_order_idx" ON "_pages_v_blocks_hero_split_panels" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_split_panels_parent_id_idx" ON "_pages_v_blocks_hero_split_panels" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_split_panels_image_idx" ON "_pages_v_blocks_hero_split_panels" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_hero_split_panels_link_link_page_idx" ON "_pages_v_blocks_hero_split_panels" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_hero_split_visibility_devices_order_idx" ON "_pages_v_blocks_hero_split_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_hero_split_visibility_devices_parent_idx" ON "_pages_v_blocks_hero_split_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_hero_split_order_idx" ON "_pages_v_blocks_hero_split" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_hero_split_parent_id_idx" ON "_pages_v_blocks_hero_split" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_hero_split_path_idx" ON "_pages_v_blocks_hero_split" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_product_rail_product_handles_order_idx" ON "_pages_v_blocks_product_rail_product_handles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_rail_product_handles_parent_id_idx" ON "_pages_v_blocks_product_rail_product_handles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_rail_visibility_devices_order_idx" ON "_pages_v_blocks_product_rail_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_product_rail_visibility_devices_parent_idx" ON "_pages_v_blocks_product_rail_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_product_rail_order_idx" ON "_pages_v_blocks_product_rail" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_product_rail_parent_id_idx" ON "_pages_v_blocks_product_rail" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_product_rail_path_idx" ON "_pages_v_blocks_product_rail" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_visibility_devices_order_idx" ON "_pages_v_blocks_editorial_two_up_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_visibility_devices_parent_idx" ON "_pages_v_blocks_editorial_two_up_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_order_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_parent_id_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_path_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_image_left_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("image_left_id");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_image_right_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("image_right_id");
  CREATE INDEX "_pages_v_blocks_editorial_two_up_link_link_page_idx" ON "_pages_v_blocks_editorial_two_up" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_tiles_order_idx" ON "_pages_v_blocks_category_tiles_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_tiles_tiles_parent_id_idx" ON "_pages_v_blocks_category_tiles_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_tiles_image_idx" ON "_pages_v_blocks_category_tiles_tiles" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_tiles_link_link_page_idx" ON "_pages_v_blocks_category_tiles_tiles" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_visibility_devices_order_idx" ON "_pages_v_blocks_category_tiles_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_category_tiles_visibility_devices_parent_idx" ON "_pages_v_blocks_category_tiles_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_order_idx" ON "_pages_v_blocks_category_tiles" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_tiles_parent_id_idx" ON "_pages_v_blocks_category_tiles" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_tiles_path_idx" ON "_pages_v_blocks_category_tiles" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_banner_visibility_devices_order_idx" ON "_pages_v_blocks_text_banner_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_text_banner_visibility_devices_parent_idx" ON "_pages_v_blocks_text_banner_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_text_banner_order_idx" ON "_pages_v_blocks_text_banner" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_text_banner_parent_id_idx" ON "_pages_v_blocks_text_banner" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_text_banner_path_idx" ON "_pages_v_blocks_text_banner" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_text_banner_link_link_page_idx" ON "_pages_v_blocks_text_banner" USING btree ("link_page_id");
  CREATE INDEX "_pages_v_blocks_usp_strip_items_order_idx" ON "_pages_v_blocks_usp_strip_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_usp_strip_items_parent_id_idx" ON "_pages_v_blocks_usp_strip_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_usp_strip_visibility_devices_order_idx" ON "_pages_v_blocks_usp_strip_visibility_devices" USING btree ("order");
  CREATE INDEX "_pages_v_blocks_usp_strip_visibility_devices_parent_idx" ON "_pages_v_blocks_usp_strip_visibility_devices" USING btree ("parent_id");
  CREATE INDEX "_pages_v_blocks_usp_strip_order_idx" ON "_pages_v_blocks_usp_strip" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_usp_strip_parent_id_idx" ON "_pages_v_blocks_usp_strip" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_usp_strip_path_idx" ON "_pages_v_blocks_usp_strip" USING btree ("_path");
  CREATE INDEX "_pages_v_parent_idx" ON "_pages_v" USING btree ("parent_id");
  CREATE INDEX "_pages_v_version_version_slug_idx" ON "_pages_v" USING btree ("version_slug");
  CREATE INDEX "_pages_v_version_seo_version_seo_og_image_idx" ON "_pages_v" USING btree ("version_seo_og_image_id");
  CREATE INDEX "_pages_v_version_version_updated_at_idx" ON "_pages_v" USING btree ("version_updated_at");
  CREATE INDEX "_pages_v_version_version_created_at_idx" ON "_pages_v" USING btree ("version_created_at");
  CREATE INDEX "_pages_v_version_version__status_idx" ON "_pages_v" USING btree ("version__status");
  CREATE INDEX "_pages_v_created_at_idx" ON "_pages_v" USING btree ("created_at");
  CREATE INDEX "_pages_v_updated_at_idx" ON "_pages_v" USING btree ("updated_at");
  CREATE INDEX "_pages_v_latest_idx" ON "_pages_v" USING btree ("latest");
  CREATE INDEX "_pages_v_autosave_idx" ON "_pages_v" USING btree ("autosave");
  CREATE INDEX "themes_updated_at_idx" ON "themes" USING btree ("updated_at");
  CREATE INDEX "themes_created_at_idx" ON "themes" USING btree ("created_at");
  CREATE INDEX "menus_items_children_order_idx" ON "menus_items_children" USING btree ("_order");
  CREATE INDEX "menus_items_children_parent_id_idx" ON "menus_items_children" USING btree ("_parent_id");
  CREATE INDEX "menus_items_children_link_link_page_idx" ON "menus_items_children" USING btree ("link_page_id");
  CREATE INDEX "menus_items_order_idx" ON "menus_items" USING btree ("_order");
  CREATE INDEX "menus_items_parent_id_idx" ON "menus_items" USING btree ("_parent_id");
  CREATE INDEX "menus_items_link_link_page_idx" ON "menus_items" USING btree ("link_page_id");
  CREATE INDEX "menus_items_featured_image_idx" ON "menus_items" USING btree ("featured_image_id");
  CREATE INDEX "menus_updated_at_idx" ON "menus" USING btree ("updated_at");
  CREATE INDEX "menus_created_at_idx" ON "menus" USING btree ("created_at");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_sizes_card_sizes_card_filename_idx" ON "media" USING btree ("sizes_card_filename");
  CREATE INDEX "media_sizes_product_sizes_product_filename_idx" ON "media" USING btree ("sizes_product_filename");
  CREATE INDEX "media_sizes_hero_sizes_hero_filename_idx" ON "media" USING btree ("sizes_hero_filename");
  CREATE INDEX "media_sizes_hero_mobile_sizes_hero_mobile_filename_idx" ON "media" USING btree ("sizes_hero_mobile_filename");
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_jobs_log_order_idx" ON "payload_jobs_log" USING btree ("_order");
  CREATE INDEX "payload_jobs_log_parent_id_idx" ON "payload_jobs_log" USING btree ("_parent_id");
  CREATE INDEX "payload_jobs_completed_at_idx" ON "payload_jobs" USING btree ("completed_at");
  CREATE INDEX "payload_jobs_total_tried_idx" ON "payload_jobs" USING btree ("total_tried");
  CREATE INDEX "payload_jobs_has_error_idx" ON "payload_jobs" USING btree ("has_error");
  CREATE INDEX "payload_jobs_task_slug_idx" ON "payload_jobs" USING btree ("task_slug");
  CREATE INDEX "payload_jobs_queue_idx" ON "payload_jobs" USING btree ("queue");
  CREATE INDEX "payload_jobs_wait_until_idx" ON "payload_jobs" USING btree ("wait_until");
  CREATE INDEX "payload_jobs_processing_idx" ON "payload_jobs" USING btree ("processing");
  CREATE INDEX "payload_jobs_updated_at_idx" ON "payload_jobs" USING btree ("updated_at");
  CREATE INDEX "payload_jobs_created_at_idx" ON "payload_jobs" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_themes_id_idx" ON "payload_locked_documents_rels" USING btree ("themes_id");
  CREATE INDEX "payload_locked_documents_rels_menus_id_idx" ON "payload_locked_documents_rels" USING btree ("menus_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "pages_blocks_hero_full_ctas" CASCADE;
  DROP TABLE "pages_blocks_hero_full_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_hero_full" CASCADE;
  DROP TABLE "pages_blocks_hero_split_panels" CASCADE;
  DROP TABLE "pages_blocks_hero_split_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_hero_split" CASCADE;
  DROP TABLE "pages_blocks_product_rail_product_handles" CASCADE;
  DROP TABLE "pages_blocks_product_rail_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_product_rail" CASCADE;
  DROP TABLE "pages_blocks_editorial_two_up_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_editorial_two_up" CASCADE;
  DROP TABLE "pages_blocks_category_tiles_tiles" CASCADE;
  DROP TABLE "pages_blocks_category_tiles_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_category_tiles" CASCADE;
  DROP TABLE "pages_blocks_text_banner_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_text_banner" CASCADE;
  DROP TABLE "pages_blocks_usp_strip_items" CASCADE;
  DROP TABLE "pages_blocks_usp_strip_visibility_devices" CASCADE;
  DROP TABLE "pages_blocks_usp_strip" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_full_ctas" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_full_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_full" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_split_panels" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_split_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_hero_split" CASCADE;
  DROP TABLE "_pages_v_blocks_product_rail_product_handles" CASCADE;
  DROP TABLE "_pages_v_blocks_product_rail_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_product_rail" CASCADE;
  DROP TABLE "_pages_v_blocks_editorial_two_up_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_editorial_two_up" CASCADE;
  DROP TABLE "_pages_v_blocks_category_tiles_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_category_tiles_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_category_tiles" CASCADE;
  DROP TABLE "_pages_v_blocks_text_banner_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_text_banner" CASCADE;
  DROP TABLE "_pages_v_blocks_usp_strip_items" CASCADE;
  DROP TABLE "_pages_v_blocks_usp_strip_visibility_devices" CASCADE;
  DROP TABLE "_pages_v_blocks_usp_strip" CASCADE;
  DROP TABLE "_pages_v" CASCADE;
  DROP TABLE "themes" CASCADE;
  DROP TABLE "menus_items_children" CASCADE;
  DROP TABLE "menus_items" CASCADE;
  DROP TABLE "menus" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_jobs_log" CASCADE;
  DROP TABLE "payload_jobs" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_pages_blocks_hero_full_ctas_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_full_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_hero_full_text_position";
  DROP TYPE "public"."enum_pages_blocks_hero_full_text_color";
  DROP TYPE "public"."enum_pages_blocks_hero_split_panels_link_type";
  DROP TYPE "public"."enum_pages_blocks_hero_split_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_product_rail_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_product_rail_source";
  DROP TYPE "public"."enum_pages_blocks_editorial_two_up_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_editorial_two_up_link_type";
  DROP TYPE "public"."enum_pages_blocks_category_tiles_tiles_link_type";
  DROP TYPE "public"."enum_pages_blocks_category_tiles_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_text_banner_visibility_devices";
  DROP TYPE "public"."enum_pages_blocks_text_banner_tone";
  DROP TYPE "public"."enum_pages_blocks_text_banner_link_type";
  DROP TYPE "public"."enum_pages_blocks_usp_strip_visibility_devices";
  DROP TYPE "public"."enum_pages_status";
  DROP TYPE "public"."enum__pages_v_blocks_hero_full_ctas_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_full_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_hero_full_text_position";
  DROP TYPE "public"."enum__pages_v_blocks_hero_full_text_color";
  DROP TYPE "public"."enum__pages_v_blocks_hero_split_panels_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_hero_split_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_product_rail_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_product_rail_source";
  DROP TYPE "public"."enum__pages_v_blocks_editorial_two_up_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_editorial_two_up_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_category_tiles_tiles_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_category_tiles_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_text_banner_visibility_devices";
  DROP TYPE "public"."enum__pages_v_blocks_text_banner_tone";
  DROP TYPE "public"."enum__pages_v_blocks_text_banner_link_type";
  DROP TYPE "public"."enum__pages_v_blocks_usp_strip_visibility_devices";
  DROP TYPE "public"."enum__pages_v_version_status";
  DROP TYPE "public"."enum_themes_tokens_radius";
  DROP TYPE "public"."enum_themes_tokens_font_display";
  DROP TYPE "public"."enum_themes_tokens_type_scale";
  DROP TYPE "public"."enum_menus_items_children_link_type";
  DROP TYPE "public"."enum_menus_items_link_type";
  DROP TYPE "public"."enum_menus_location";
  DROP TYPE "public"."enum_media_usage";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_payload_jobs_log_task_slug";
  DROP TYPE "public"."enum_payload_jobs_log_state";
  DROP TYPE "public"."enum_payload_jobs_task_slug";`)
}
