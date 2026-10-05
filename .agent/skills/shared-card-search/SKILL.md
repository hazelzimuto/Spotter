---
name: shared-card-search
description: Step by step procedure for processing member question rewrites, vector similarity retrieval, similarity threshold filtering, and grounded Q&A answer formatting.
---

# Shared Card Search Procedure

Execute this procedure when building or updating the member question rewriting, vector search, and grounded Q&A pipeline.

## Step 1: Receive Question and Session Tier
Extract the raw question text from the request body. Retrieve the active member session to determine the user's tier.

## Step 2: Rewrite Semantic Query
Pass the raw text to Google Gemini API to extract intent and produce a clean, concise semantic search query.

## Step 3: Generate Embedding Vector
Pass the rewritten semantic query string to the OpenAI API to generate a vector embedding. Follow `rules/dimensions.md` for embedding specifications.

## Step 4: Execute Pre-Filtered Vector Search
Execute raw SQL via Prisma `prisma.$queryRaw` joining `CardVersion` and `Card`. Follow `rules/sql.md` for vector query structure and tier pre-filtering.

## Step 5: Evaluate Distance Threshold
Check the nearest result's cosine distance against the threshold. Follow `rules/thresholds.md` for similarity cutoff values.
If distance exceeds the cutoff threshold, halt generation and return the hardcoded refusal string `REFUSE: No record`.

## Step 6: Generate Grounded Answer
If within threshold, pass retrieved card text and raw question to Google Gemini API with the system prompt to generate a concise 1-2 sentence answer.

## Step 7: Render Source Citation
Append the exact text of the matched source card and `lastConfirmedAt` date in a distinct UI citation block below the formatted answer.
