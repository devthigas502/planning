import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Decimal } from "decimal.js"

// GET: Listar transações com filtros
export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")
    const type = searchParams.get("type") // receita ou despesa

    interface WhereClause {
      userId: string
      date?: {
        gte: Date
        lte: Date
      }
      type?: string
    }

    const whereClause: WhereClause = {
      userId: session.user.id,
    }

    // Filtrar por mês e ano
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      whereClause.date = {
        gte: startDate,
        lte: endDate,
      }
    }

    // Filtrar por tipo
    if (type && (type === "receita" || type === "despesa")) {
      whereClause.type = type
    }

    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error("Erro ao buscar transações:", error)
    return NextResponse.json(
      { error: "Erro ao buscar transações" },
      { status: 500 }
    )
  }
}

// POST: Criar nova transação
export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { type, title, amount, date, category, account, observations, recurrence } = body

    if (!type || !title || !amount || !date || !category) {
      return NextResponse.json(
        { error: "Tipo, título, valor, data e categoria são obrigatórios" },
        { status: 400 }
      )
    }

    if (type !== "receita" && type !== "despesa") {
      return NextResponse.json(
        { error: "Tipo deve ser 'receita' ou 'despesa'" },
        { status: 400 }
      )
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        title,
        amount: new Decimal(amount),
        date: new Date(date + "T12:00:00.000Z"),
        category,
        account: account || null,
        observations: observations || null,
        recurrence: recurrence || null,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar transação:", error)
    return NextResponse.json(
      { error: "Erro ao criar transação" },
      { status: 500 }
    )
  }
}
