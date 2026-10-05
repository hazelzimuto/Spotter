---
name: member-check-in
description: Step by step procedure for validating whiteboard check-in codes, checking 4-hour suppression windows, logging attendance records, and returning visit counts.
---

# Member Check In Procedure

Execute this procedure when implementing or modifying member check-in validation, attendance logging, and monthly visit count updates.

## Step 1: Receive Whiteboard Code Input
Member enters 4-digit code into app number pad. Follow `rules/thresholds.md` for code length rules.

## Step 2: Fetch Active Daily Code
Query `CheckInCode` table for record matching current calendar date. Follow `rules/schema.md` for model fields. Return error if code is missing or mismatched.

## Step 3: Fetch Member Attendance History
Extract `memberId` from verified session. Query `Attendance` table for member's most recent check-in timestamp. Follow `rules/architecture.md` for session filtering.

## Step 4: Enforce 4-Hour Suppression Window
Calculate time difference between current time and most recent check-in timestamp. Follow `rules/thresholds.md` for suppression window limits. If within window, return error message.

## Step 5: Record Attendance Row
Insert new `Attendance` record with current timestamp and setting `isManual = false`.

## Step 6: Calculate Monthly Attendance Count
Query `Attendance` table counting distinct calendar days trained by `memberId` within current calendar month.

## Step 7: Return Success Payload
Return success response with total monthly visit count and update local storage cached status.
