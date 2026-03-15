// Testa se a conexão com o banco de produção funciona com SSL estrito (rejectUnauthorized: true)
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: true }, // Igual ao db.ts em produção
})
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter } as never)

async function main() {
  console.log("Testando conexão com SSL estrito (rejectUnauthorized: true)...")
  const user = await db.user.findUnique({
    where: { email: "premium@teste.com" },
    select: { id: true, email: true, emailVerified: true, passwordHash: true },
  })

  if (!user) { console.log("❌ Usuário não encontrado"); return }
  console.log("✅ Conexão OK | email:", user.email)
  console.log("emailVerified:", user.emailVerified)
  const match = user.passwordHash ? await bcrypt.compare("premium123", user.passwordHash) : false
  console.log("bcrypt match:", match)
}

main()
  .catch(e => console.error("❌ ERRO SSL:", e.message))
  .finally(async () => { await db.$disconnect(); await pool.end() })
