-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15),
    "email" VARCHAR(50) NOT NULL,
    "is_activated" BOOLEAN DEFAULT false,
    "is_approved" BOOLEAN DEFAULT false,
    "activation_link" TEXT,
    "hashed_password" TEXT NOT NULL,
    "hashed_refresh_token" TEXT,
    "role" TEXT,
    "created_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
