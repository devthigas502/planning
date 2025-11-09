import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function RotinasPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Rotinas</h1>
          <p className="text-muted-foreground">Afazeres e rotinas de estudo</p>
        </div>
        <Button>+ Nova Rotina</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Rotinas de Casa</CardTitle>
            <CardDescription>Tarefas domésticas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma rotina cadastrada ainda.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rotinas de Estudo</CardTitle>
            <CardDescription>Planejamento de estudos</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Nenhuma rotina cadastrada ainda.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
