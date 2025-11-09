import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// GET: Listar todas as notas do usuário
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
    const folder = searchParams.get("folder")

    const notes = await prisma.note.findMany({
      where: {
        userId: session.user.id,
        ...(folder && { folder }),
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(notes)
  } catch (error) {
    console.error("Erro ao buscar notas:", error)
    return NextResponse.json(
      { error: "Erro ao buscar notas" },
      { status: 500 }
    )
  }
}

// POST: Criar nova nota
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
    const { title, content, folder } = body

    if (!title) {
      return NextResponse.json(
        { error: "Título é obrigatório" },
        { status: 400 }
      )
    }

    const note = await prisma.note.create({
      data: {
        userId: session.user.id,
        title,
        content: content || "",
        folder: folder || null,
      },
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error("Erro ao criar nota:", error)
    return NextResponse.json(
      { error: "Erro ao criar nota" },
      { status: 500 }
    )
  }
}
