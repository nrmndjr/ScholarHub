-- CreateTable
CREATE TABLE "WritingDocument" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "projectId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WritingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WritingBlock" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "blockType" TEXT NOT NULL,
    "textContent" TEXT,
    "articleId" TEXT,
    "highlightId" TEXT,
    "commentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WritingBlock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WritingDocument_userId_idx" ON "WritingDocument"("userId");

-- CreateIndex
CREATE INDEX "WritingBlock_documentId_order_idx" ON "WritingBlock"("documentId", "order");

-- AddForeignKey
ALTER TABLE "WritingDocument" ADD CONSTRAINT "WritingDocument_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingDocument" ADD CONSTRAINT "WritingDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingBlock" ADD CONSTRAINT "WritingBlock_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "WritingDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingBlock" ADD CONSTRAINT "WritingBlock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingBlock" ADD CONSTRAINT "WritingBlock_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingBlock" ADD CONSTRAINT "WritingBlock_highlightId_fkey" FOREIGN KEY ("highlightId") REFERENCES "Highlight"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WritingBlock" ADD CONSTRAINT "WritingBlock_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
