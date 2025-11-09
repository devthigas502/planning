import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Decimal } from "decimal.js"

// GET: Buscar transação específica
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error("Erro ao buscar transação:", error)
    return NextResponse.json(
      { error: "Erro ao buscar transação" },
      { status: 500 }
    )
  }
}

// PATCH: Atualizar transação
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      )
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: params.id },
      data: {
        ...(type !== undefined && { type }),
        ...(title !== undefined && { title }),
        ...(amount !== undefined && { amount: new Decimal(amount) }),
        ...(date !== undefined && { date: new Date(date + "T12:00:00.000Z") }),
        ...(category !== undefined && { category }),
        ...(account !== undefined && { account }),
        ...(observations !== undefined && { observations }),
        ...(recurrence !== undefined && { recurrence }),
      },
    })

    return NextResponse.json(updatedTransaction)
  } catch (error) {
    console.error("Erro ao atualizar transação:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar transação" },
      { status: 500 }
    )
  }
}

// DELETE: Excluir transação
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!transaction) {
      return NextResponse.json(
        { error: "Transação não encontrada" },
        { status: 404 }
      )
    }

    await prisma.transaction.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir transação:", error)
    return NextResponse.json(
      { error: "Erro ao excluir transação" },
      { status: 500 }
    )
  }
}
