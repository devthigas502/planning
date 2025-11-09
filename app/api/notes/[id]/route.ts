import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

// GET: Buscar nota específica
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

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      )
    }

    return NextResponse.json(note)
  } catch (error) {
    console.error("Erro ao buscar nota:", error)
    return NextResponse.json(
      { error: "Erro ao buscar nota" },
      { status: 500 }
    )
  }
}

// PATCH: Atualizar nota
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
    const { title, content, folder } = body

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      )
    }

    const updatedNote = await prisma.note.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        ...(folder !== undefined && { folder }),
      },
    })

    return NextResponse.json(updatedNote)
  } catch (error) {
    console.error("Erro ao atualizar nota:", error)
    return NextResponse.json(
      { error: "Erro ao atualizar nota" },
      { status: 500 }
    )
  }
}

// DELETE: Excluir nota
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

    const note = await prisma.note.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!note) {
      return NextResponse.json(
        { error: "Nota não encontrada" },
        { status: 404 }
      )
    }

    await prisma.note.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir nota:", error)
    return NextResponse.json(
      { error: "Erro ao excluir nota" },
      { status: 500 }
    )
  }
}
