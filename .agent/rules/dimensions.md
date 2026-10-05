# Dimensions Rules

## Job
Define vector embedding array dimensions, embedding model names, and chunk parsing bounds.

## Rules and Reasons

### Rule 1
Embedding model is set to `text-embedding-3-small`.
**Reason**: Standardizes vector generation across document indexing and semantic query rewriting.

### Rule 2
Embedding vector dimension length is set to exactly `1536` floating point numbers.
**Reason**: Mismatched array lengths cause immediate PostgreSQL vector column insertion failures.

### Rule 3
Each approved `CardVersion` content string is processed as `1 single chunk`.
**Reason**: Shared cards are written as short, self-contained paragraphs, eliminating the need for text splitting algorithms.
