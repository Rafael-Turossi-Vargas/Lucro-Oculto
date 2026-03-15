import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const [, , email, passwordToTest] = process.argv

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter } as never)

async function main() {
  const user = await db.user.findUnique({
    where: { email: email?.toLowerCase() ?? "premium@teste.com" },
    select: { id: true, email: true, emailVerified: true, passwordHash: true },
  })

  if (!user) {
    console.log("❌ Usuário não encontrado")
    return
  }

  console.log("email:", user.email)
  console.log("emailVerified:", user.emailVerified)
  console.log("passwordHash prefix:", user.passwordHash?.substring(0, 10))

  if (passwordToTest && user.passwordHash) {
    const match = await bcrypt.compare(passwordToTest, user.passwordHash)
    console.log(`bcrypt.compare("${passwordToTest}", hash) =`, match)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
