import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: 'postgresql://edumanager_user:edumanager_pass_2026@localhost:5432/edumanager_db',
  },
})