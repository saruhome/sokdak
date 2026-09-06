-- Reclassify two words that no longer fit the outdated-slang category.
-- Operator rule (2026-09-06): outdated-slang must contain only words that are
-- rarely used today or used mainly by people in their late 30s and older.
-- 좋좋소 (id 27): coined around the 2021 web drama and still actively used by
--   young office workers, so it moves to work (was outdated-slang + work).
-- 훈남 (id 178): an established everyday word used across all ages, not a
--   faded fad, so it moves to daily.

update words set category = 'work', secondary_category = null where id = '27';
update words set category = 'daily' where id = '178';
