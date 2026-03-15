import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import "dotenv/config"

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter } as never)

async function main() {
  const users = await db.user.findMany({
    where: { OR: [{ email: { contains: "premium" } }, { email: { contains: "teste" } }] },
    select: { id: true, email: true, emailVerified: true, passwordHash: true, createdAt: true },
  })

  if (users.length === 0) {
    console.log("Nenhum usuário encontrado com esse email")
  } else {
    for (const u of users) {
      console.log("email:", u.email)
      console.log("emailVerified:", u.emailVerified)
      console.log("passwordHash:", u.passwordHash ? "SET (" + u.passwordHash.substring(0, 10) + "...)" : "NULL")
      console.log("createdAt:", u.createdAt)
      console.log("---")
    }
  }

  const token = await db.verificationToken.findFirst({
    where: { identifier: "premium@teste.com" },
  })
  console.log("verificationToken:", token ? JSON.stringify(token) : "none")
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
