import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function ComprasPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lista de Compras</h1>
          <p className="text-muted-foreground">Organize suas compras mensais</p>
        </div>
        <Button>+ Novo Item</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compras do Mês</CardTitle>
          <CardDescription>Novembro 2025</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum item na lista ainda.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
