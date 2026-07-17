import path from 'path'
import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: 'postgresql://edumanager_user:edumanager_pass_2026@localhost:5432/edumanager_db',
  },
  migrate: {
    async adapter() {
      const { PrismaPg } = await import('@prisma/adapter-pg')
      const connectionString = 'postgresql://edumanager_user:edumanager_pass_2026@localhost:5432/edumanager_db'
      return new PrismaPg({ connectionString })
    },
  },
})