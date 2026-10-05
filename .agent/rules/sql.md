# SQL Rules

## Job
Define raw PostgreSQL vector extension setup, index creation commands, and similarity search queries.

## Rules and Reasons

### Rule 1
`pgvector` extension must be registered using `CREATE EXTENSION IF NOT EXISTS vector;`.
**Reason**: PostgreSQL rejects vector data types and distance operators if the extension is missing from the database.

### Rule 2
`CardVersion` embedding column must use an HNSW index with `vector_cosine_ops`.
**Reason**: Hierarchical Navigable Small World indexes accelerate cosine distance queries over text embeddings.

### Rule 3
Semantic similarity search must execute raw SQL matching `WHERE c.isApproved = true AND c.requiredTier IN ('BASIC', $userTier) ORDER BY cv.embedding <=> $embedding::vector LIMIT 3`.
**Reason**: Prisma ORM cannot generate `pgvector` distance operators natively, and tier pre-filtering prevents data leakage across tiers.
