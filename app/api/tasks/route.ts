import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month")
    const year = searchParams.get("year")

    let tasks
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      tasks = await prisma.task.findMany({
        where: {
          userId: session.user.id,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { date: "asc" },
      })
    } else {
      tasks = await prisma.task.findMany({
        where: { userId: session.user.id },
        orderBy: { date: "asc" },
        take: 50,
      })
    }

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar tarefas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date, startTime, endTime, category } = body

    if (!title || !date) {
      return NextResponse.json(
        { error: "Título e data são obrigatórios" },
        { status: 400 }
      )
    }

    const task = await prisma.task.create({
      data: {
        userId: session.user.id,
        title,
        description: description || null,
        date: new Date(date + "T12:00:00.000Z"), // Adiciona meio-dia UTC para evitar problemas de fuso horário
        startTime: startTime || null,
        endTime: endTime || null,
        category: category || null,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tarefa:", error)
    return NextResponse.json(
      { error: "Erro ao criar tarefa" },
      { status: 500 }
    )
  }
}
