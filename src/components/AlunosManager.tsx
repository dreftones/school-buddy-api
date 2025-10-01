import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAlunos, type Aluno } from "@/hooks/useAlunos";
import { AlunoForm } from "./AlunoForm";
import { AlunosTable } from "./AlunosTable";
import { Plus, Search, LogOut, GraduationCap, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export default function AlunosManager() {
  const {
    alunos,
    loading,
    searchTerm,
    setSearchTerm,
    cursoFilter,
    setCursoFilter,
    page,
    setPage,
    totalCount,
    itemsPerPage,
    createAluno,
    updateAluno,
    deleteAluno,
    getCursos,
  } = useAlunos();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Você saiu do sistema");
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingAluno) {
      await updateAluno(editingAluno.id, data);
    } else {
      await createAluno(data);
    }
    setEditingAluno(null);
  };

  const handleFormClose = (open: boolean) => {
    if (!open) {
      setEditingAluno(null);
    }
    setFormOpen(open);
  };

  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const cursos = getCursos();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/10 to-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary rounded-xl p-2.5 shadow-md">
                <GraduationCap className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Sistema de Alunos</h1>
                <p className="text-sm text-muted-foreground">Gerenciamento completo de estudantes</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut} className="gap-2">
              <LogOut className="w-4 h-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="shadow-lg border-border/50 animate-fade-in">
          <CardHeader className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl">Lista de Alunos</CardTitle>
                <CardDescription>
                  {totalCount} {totalCount === 1 ? "aluno cadastrado" : "alunos cadastrados"}
                </CardDescription>
              </div>
              <Button onClick={() => setFormOpen(true)} className="gap-2 shadow-md">
                <Plus className="w-4 h-4" />
                Novo Aluno
              </Button>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, email ou matrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2 sm:w-64">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={cursoFilter} onValueChange={setCursoFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por curso" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value=" ">Todos os cursos</SelectItem>
                    {cursos.map((curso) => (
                      <SelectItem key={curso} value={curso || ""}>
                        {curso}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <AlunosTable
              alunos={alunos}
              loading={loading}
              onEdit={handleEdit}
              onDelete={deleteAluno}
            />

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Página {page} de {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="gap-1"
                  >
                    Próxima
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <AlunoForm
        open={formOpen}
        onOpenChange={handleFormClose}
        onSubmit={handleFormSubmit}
        aluno={editingAluno}
      />
    </div>
  );
}
