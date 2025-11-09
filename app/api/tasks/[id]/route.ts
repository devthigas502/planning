import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Erro ao buscar tarefa:", error)
    return NextResponse.json(
      { error: "Erro ao buscar tarefa" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, startTime, endTime, category, completed } = body

    const task = await prisma.task.updateMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(date !== undefined && { date: new Date(date + "T12:00:00.000Z") }), // Adiciona meio-dia UTC para evitar problemas de fuso horário
        ...(startTime !== undefined && { startTime }),
        ...(endTime !== undefined && { endTime }),
        ...(category !== undefined && { category }),
        ...(completed !== undefined && { completed }),
      },
    })

    if (task.count === 0) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    const updatedTask = await prisma.task.findUnique({
      where: { id: params.id },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar tarefa" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const task = await prisma.task.deleteMany({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (task.count === 0) {
      return NextResponse.json({ error: "Tarefa não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ message: "Tarefa deletada com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar tarefa:", error)
    return NextResponse.json(
      { error: "Erro ao deletar tarefa" },
      { status: 500 }
    )
  }
}
