import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

export const alunoSchema = z.object({
  nome: z.string().trim().min(1, "Nome é obrigatório").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("Email inválido").max(255, "Email deve ter no máximo 255 caracteres"),
  matricula: z.string().trim().min(1, "Matrícula é obrigatória").max(50, "Matrícula deve ter no máximo 50 caracteres"),
  data_nascimento: z.string().optional(),
  curso: z.string().trim().max(100, "Curso deve ter no máximo 100 caracteres").optional(),
});

export type Aluno = {
  id: string;
  nome: string;
  email: string;
  matricula: string;
  data_nascimento: string | null;
  curso: string | null;
  created_at: string;
  updated_at: string;
};

export type AlunoInput = z.infer<typeof alunoSchema>;

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cursoFilter, setCursoFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  const fetchAlunos = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("alunos")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range((page - 1) * itemsPerPage, page * itemsPerPage - 1);

      // Aplicar filtros
      if (searchTerm) {
        query = query.or(`nome.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,matricula.ilike.%${searchTerm}%`);
      }

      if (cursoFilter) {
        query = query.eq("curso", cursoFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setAlunos(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      toast.error("Erro ao carregar alunos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, [page, searchTerm, cursoFilter]);

  const createAluno = async (aluno: AlunoInput) => {
    try {
      // Validação
      alunoSchema.parse(aluno);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase.from("alunos").insert({
        nome: aluno.nome,
        email: aluno.email,
        matricula: aluno.matricula,
        data_nascimento: aluno.data_nascimento || null,
        curso: aluno.curso || null,
        user_id: user.id,
      } as any);

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("email")) {
            throw new Error("Este email já está cadastrado");
          }
          if (error.message.includes("matricula")) {
            throw new Error("Esta matrícula já está cadastrada");
          }
        }
        throw error;
      }

      toast.success("Aluno cadastrado com sucesso!");
      fetchAlunos();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const updateAluno = async (id: string, aluno: AlunoInput) => {
    try {
      // Validação
      alunoSchema.parse(aluno);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { error } = await supabase
        .from("alunos")
        .update({
          nome: aluno.nome,
          email: aluno.email,
          matricula: aluno.matricula,
          data_nascimento: aluno.data_nascimento || null,
          curso: aluno.curso || null,
          user_id: user.id,
        } as any)
        .eq("id", id);

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("email")) {
            throw new Error("Este email já está cadastrado");
          }
          if (error.message.includes("matricula")) {
            throw new Error("Esta matrícula já está cadastrada");
          }
        }
        throw error;
      }

      toast.success("Aluno atualizado com sucesso!");
      fetchAlunos();
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      }
      throw error;
    }
  };

  const deleteAluno = async (id: string) => {
    try {
      const { error } = await supabase.from("alunos").delete().eq("id", id);

      if (error) throw error;

      toast.success("Aluno removido com sucesso!");
      fetchAlunos();
    } catch (error) {
      console.error("Erro ao deletar aluno:", error);
      toast.error("Erro ao remover aluno");
    }
  };

  const getCursos = () => {
    return [...new Set(alunos.map((a) => a.curso).filter(Boolean))];
  };

  return {
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
  };
}
