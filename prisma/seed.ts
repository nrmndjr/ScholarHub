import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('senha123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@scholarhub.dev' },
    update: {},
    create: {
      email: 'demo@scholarhub.dev',
      name: 'Pesquisador Demo',
      passwordHash,
    },
  });

  const folder = await prisma.folder.upsert({
    where: { id: 'demo-folder' },
    update: {},
    create: {
      id: 'demo-folder',
      userId: user.id,
      name: 'Leituras gerais',
      color: '#6366f1',
    },
  });

  await prisma.tag.upsert({
    where: { userId_name: { userId: user.id, name: 'metodologia' } },
    update: {},
    create: { userId: user.id, name: 'metodologia', color: '#22c55e' },
  });

  await prisma.tag.upsert({
    where: { userId_name: { userId: user.id, name: 'revisão' } },
    update: {},
    create: { userId: user.id, name: 'revisão', color: '#f59e0b' },
  });

  await prisma.project.upsert({
    where: { id: 'demo-project' },
    update: {},
    create: {
      id: 'demo-project',
      userId: user.id,
      name: 'Dissertação de Mestrado',
      description: 'Projeto de exemplo criado pelo seed.',
      objective: 'Explorar o ScholarHub com dados de demonstração.',
      researchQuestion: 'Como estruturar a leitura de artigos científicos?',
      hypotheses: ['Hipótese 1 de exemplo', 'Hipótese 2 de exemplo'],
      keywords: ['pesquisa', 'gestão do conhecimento'],
      color: '#0ea5e9',
    },
  });

  console.log('Seed concluído:', { userId: user.id, folderId: folder.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
