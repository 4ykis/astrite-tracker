-- Balance is now logged as check-ins throughout the day instead of one
-- upserted snapshot per calendar day, so multiple entries per day (and per
-- business day, see src/lib/date.ts) must be allowed.
DROP INDEX "BalanceEntry_date_key";
