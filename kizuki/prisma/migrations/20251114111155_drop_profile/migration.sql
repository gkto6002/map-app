/*
  Warnings:

  - You are about to drop the `profiles` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `userId` on table `posts` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_userId_fkey";

-- AlterTable
ALTER TABLE "posts" ALTER COLUMN "userId" SET NOT NULL;

-- DropTable
DROP TABLE "profiles";
