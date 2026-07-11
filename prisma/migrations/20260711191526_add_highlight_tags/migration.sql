-- CreateTable
CREATE TABLE "HighlightTag" (
    "highlightId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "HighlightTag_pkey" PRIMARY KEY ("highlightId","tagId")
);

-- AddForeignKey
ALTER TABLE "HighlightTag" ADD CONSTRAINT "HighlightTag_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HighlightTag" ADD CONSTRAINT "HighlightTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
