ALTER TABLE "File" ADD COLUMN IF NOT EXISTS "userId" TEXT;
ALTER TABLE "SavedPrompt" ADD COLUMN IF NOT EXISTS "userId" TEXT;

CREATE INDEX IF NOT EXISTS "File_userId_idx" ON "File"("userId");
CREATE INDEX IF NOT EXISTS "SavedPrompt_userId_idx" ON "SavedPrompt"("userId");
