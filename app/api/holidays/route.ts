import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let holidays
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      holidays = await prisma.holiday.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      })
    } else {
      holidays = await prisma.holiday.findMany({
        orderBy: { date: "asc" },
      })
    }

    return NextResponse.json(holidays)
  } catch (error) {
    console.error("Erro ao buscar feriados:", error)
    return NextResponse.json(
      { error: "Erro ao buscar feriados" },
      { status: 500 }
    )
  }
}
