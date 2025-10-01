import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { type Aluno, type AlunoInput } from "@/hooks/useAlunos";

interface AlunoFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (aluno: AlunoInput) => Promise<void>;
  aluno?: Aluno | null;
}

export function AlunoForm({ open, onOpenChange, onSubmit, aluno }: AlunoFormProps) {
  const [formData, setFormData] = useState<AlunoInput>({
    nome: "",
    email: "",
    matricula: "",
    data_nascimento: "",
    curso: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (aluno) {
      setFormData({
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        data_nascimento: aluno.data_nascimento || "",
        curso: aluno.curso || "",
      });
    } else {
      setFormData({
        nome: "",
        email: "",
        matricula: "",
        data_nascimento: "",
        curso: "",
      });
    }
  }, [aluno, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{aluno ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
          <DialogDescription>
            {aluno ? "Atualize as informações do aluno" : "Preencha os dados do novo aluno"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                placeholder="Nome completo do aluno"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="email@exemplo.com"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula *</Label>
              <Input
                id="matricula"
                value={formData.matricula}
                onChange={(e) => setFormData({ ...formData, matricula: e.target.value })}
                placeholder="Número da matrícula"
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                value={formData.data_nascimento}
                onChange={(e) => setFormData({ ...formData, data_nascimento: e.target.value })}
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="curso">Curso</Label>
              <Input
                id="curso"
                value={formData.curso}
                onChange={(e) => setFormData({ ...formData, curso: e.target.value })}
                placeholder="Nome do curso"
                disabled={loading}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : aluno ? "Atualizar" : "Cadastrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
