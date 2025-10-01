-- Criar tabela de alunos
CREATE TABLE IF NOT EXISTS public.alunos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL CHECK (nome <> ''),
  email TEXT NOT NULL UNIQUE,
  matricula TEXT NOT NULL UNIQUE,
  data_nascimento DATE,
  curso TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Adicionar constraint de email válido
ALTER TABLE public.alunos 
ADD CONSTRAINT valid_email 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Criar índices para melhorar performance das buscas
CREATE INDEX idx_alunos_nome ON public.alunos(nome);
CREATE INDEX idx_alunos_email ON public.alunos(email);
CREATE INDEX idx_alunos_matricula ON public.alunos(matricula);
CREATE INDEX idx_alunos_curso ON public.alunos(curso);
CREATE INDEX idx_alunos_user_id ON public.alunos(user_id);

-- Habilitar Row Level Security
ALTER TABLE public.alunos ENABLE ROW LEVEL SECURITY;

-- Política para permitir que usuários autenticados vejam todos os alunos
CREATE POLICY "Usuários autenticados podem ver alunos"
ON public.alunos
FOR SELECT
TO authenticated
USING (true);

-- Política para permitir que usuários autenticados criem alunos
CREATE POLICY "Usuários autenticados podem criar alunos"
ON public.alunos
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários autenticados atualizem alunos
CREATE POLICY "Usuários autenticados podem atualizar alunos"
ON public.alunos
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (auth.uid() = user_id);

-- Política para permitir que usuários autenticados deletem alunos
CREATE POLICY "Usuários autenticados podem deletar alunos"
ON public.alunos
FOR DELETE
TO authenticated
USING (true);

-- Criar função para atualizar o timestamp automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_alunos_updated_at
BEFORE UPDATE ON public.alunos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();