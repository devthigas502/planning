import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Decimal } from "decimal.js"

// GET: Obter resumo financeiro do mês
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

    if (!month || !year) {
      return NextResponse.json(
        { error: "Mês e ano são obrigatórios" },
        { status: 400 }
      )
    }

    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)

    // Buscar todas as transações do mês
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    })

    // Calcular receitas
    const receitas = transactions
      .filter(t => t.type === "receita")
      .reduce((acc, t) => acc.add(t.amount), new Decimal(0))

    // Calcular despesas
    const despesas = transactions
      .filter(t => t.type === "despesa")
      .reduce((acc, t) => acc.add(t.amount), new Decimal(0))

    // Calcular saldo
    const saldo = receitas.minus(despesas)

    // Agrupar por categoria
    const porCategoria = transactions.reduce((acc: Record<string, { receitas: Decimal; despesas: Decimal }>, t) => {
      if (!acc[t.category]) {
        acc[t.category] = {
          receitas: new Decimal(0),
          despesas: new Decimal(0),
        }
      }
      
      if (t.type === "receita") {
        acc[t.category].receitas = acc[t.category].receitas.add(t.amount)
      } else {
        acc[t.category].despesas = acc[t.category].despesas.add(t.amount)
      }
      
      return acc
    }, {} as Record<string, { receitas: Decimal; despesas: Decimal }>)

    // Converter Decimal para número
    const porCategoriaFormatted = Object.entries(porCategoria).map(([category, values]) => ({
      category,
      receitas: parseFloat(values.receitas.toString()),
      despesas: parseFloat(values.despesas.toString()),
    }))

    return NextResponse.json({
      receitas: parseFloat(receitas.toString()),
      despesas: parseFloat(despesas.toString()),
      saldo: parseFloat(saldo.toString()),
      porCategoria: porCategoriaFormatted,
      totalTransacoes: transactions.length,
    })
  } catch (error) {
    console.error("Erro ao buscar resumo:", error)
    return NextResponse.json(
      { error: "Erro ao buscar resumo" },
      { status: 500 }
    )
  }
}
