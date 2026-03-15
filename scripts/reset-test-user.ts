/**
 * Script para resetar senha e verificar email de um usuário de teste.
 * Uso: npx tsx scripts/reset-test-user.ts <email> <nova-senha>
 * Exemplo: npx tsx scripts/reset-test-user.ts premium@teste.com Senha@123
 */
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import "dotenv/config"

const [, , email, password] = process.argv

if (!email || !password) {
  console.error("Uso: npx tsx scripts/reset-test-user.ts <email> <nova-senha>")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const db = new PrismaClient({ adapter } as never)

async function main() {
  const user = await db.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    console.error(`Usuário ${email} não encontrado`)
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  await db.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      emailVerified: new Date(), // marca email como verificado
    },
  })

  // Remove tokens de verificação pendentes
  await db.verificationToken.deleteMany({ where: { identifier: email.toLowerCase() } })

  console.log(`✅ Senha resetada e email verificado para: ${email}`)
  console.log(`   Nova senha: ${password}`)
}

main()
  .catch(console.error)
  .finally(async () => {
    await db.$disconnect()
    await pool.end()
  })
