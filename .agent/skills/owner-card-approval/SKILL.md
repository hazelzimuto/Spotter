---
name: owner-card-approval
description: Step by step procedure for processing owner card approvals, generating vector embeddings, handling transactional rollbacks, and updating card approval states.
---

# Owner Card Approval Procedure

Execute this procedure when building or updating owner shared card approval interfaces and embedding generation workflows.

## Step 1: Receive Approval Action
Owner clicks approve action on a drafted `CardVersion` row.

## Step 2: Open Database Transaction
Initialize a Prisma database transaction block.

## Step 3: Generate Embedding Vector
Call OpenAI API passing `CardVersion.content`. Follow `rules/dimensions.md` for embedding model and array specifications.

## Step 4: Handle Embedding Generation Failure
If API call fails or times out, abort execution, roll back database transaction immediately, and return error alert to owner.

## Step 5: Save Vector Embedding
Update `CardVersion` row saving generated vector into `embedding` column. Follow `rules/schema.md` for model fields.

## Step 6: Update Parent Card Approval Status
Update parent `Card` row setting `isApproved = true` and setting `lastConfirmedAt = now()`.

## Step 7: Commit Transaction
Commit database transaction and refresh owner interface card table.
