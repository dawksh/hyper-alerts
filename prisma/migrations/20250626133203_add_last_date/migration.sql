-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "last_alert" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
