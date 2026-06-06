-- Migration 004: Legal chunks table for RAG pipeline
-- Enable pgvector, create legal_chunks, HNSW index, match function

create extension if not exists vector;

create table if not exists legal_chunks (
  id uuid primary key default gen_random_uuid(),
  source_document text not null,
  section text,
  chunk_index integer not null default 0,
  content text not null,
  embedding vector(1024),
  created_at timestamptz default now()
);

alter table legal_chunks enable row level security;

create policy "anyone can read legal chunks"
  on legal_chunks for select using (true);

create policy "service role can manage legal chunks"
  on legal_chunks for all using (auth.role() = 'service_role');

create index if not exists legal_chunks_embedding_idx
  on legal_chunks using hnsw (embedding vector_cosine_ops)
  with (m = 16, ef_construction = 64);

create unique index if not exists legal_chunks_source_chunk_idx
  on legal_chunks (source_document, chunk_index);

create or replace function match_legal_chunks(
  query_embedding vector(1024),
  match_count int default 5
)
returns table (
  id uuid,
  content text,
  source_document text,
  section text,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    source_document,
    section,
    1 - (embedding <=> query_embedding) as similarity
  from legal_chunks
  where embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
