import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // Feriados nacionais 2025
  const holidays2025 = [
    { title: 'Ano Novo', date: new Date('2025-01-01'), type: 'nacional', description: 'Confraternização Universal' },
    { title: 'Carnaval', date: new Date('2025-03-03'), type: 'nacional', description: 'Ponto Facultativo' },
    { title: 'Carnaval', date: new Date('2025-03-04'), type: 'nacional', description: 'Carnaval' },
    { title: 'Sexta-feira Santa', date: new Date('2025-04-18'), type: 'nacional', description: 'Paixão de Cristo' },
    { title: 'Tiradentes', date: new Date('2025-04-21'), type: 'nacional', description: 'Tiradentes' },
    { title: 'Dia do Trabalho', date: new Date('2025-05-01'), type: 'nacional', description: 'Dia Mundial do Trabalho' },
    { title: 'Corpus Christi', date: new Date('2025-06-19'), type: 'nacional', description: 'Corpus Christi' },
    { title: 'Independência do Brasil', date: new Date('2025-09-07'), type: 'nacional', description: '7 de Setembro' },
    { title: 'Nossa Senhora Aparecida', date: new Date('2025-10-12'), type: 'nacional', description: 'Padroeira do Brasil' },
    { title: 'Finados', date: new Date('2025-11-02'), type: 'nacional', description: 'Dia de Finados' },
    { title: 'Proclamação da República', date: new Date('2025-11-15'), type: 'nacional', description: '15 de Novembro' },
    { title: 'Consciência Negra', date: new Date('2025-11-20'), type: 'nacional', description: 'Dia da Consciência Negra' },
    { title: 'Natal', date: new Date('2025-12-25'), type: 'nacional', description: 'Natal' },
    
    // Feriados municipais de Jundiaí
    { title: 'Aniversário de Jundiaí', date: new Date('2025-12-14'), type: 'municipal', description: 'Fundação da cidade' },
  ]

  // Inserir feriados
  for (const holiday of holidays2025) {
    await prisma.holiday.upsert({
      where: {
        id: `${holiday.type}-${holiday.date.toISOString().split('T')[0]}`,
      },
      update: {},
      create: {
        id: `${holiday.type}-${holiday.date.toISOString().split('T')[0]}`,
        ...holiday,
      },
    })
  }

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
