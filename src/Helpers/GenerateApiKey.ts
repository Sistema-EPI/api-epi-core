import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateAndSetApiKey(companyId: string): Promise<string> {
  const apiKey = Buffer.from(companyId.toString()).toString("base64");

  await prisma.company.update({
    where: { idEmpresa: companyId },
    data: { apiKey },
  });

  return apiKey;
}
