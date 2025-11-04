-- Configuração do Supabase Storage para upload de fotos
-- Execute estes comandos no SQL Editor do Supabase

-- 1. Criar bucket para uploads (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Criar políticas de segurança para o bucket uploads

-- Política para permitir upload de arquivos (usuários logados)
CREATE POLICY "Usuários podem fazer upload de fotos" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'uploads' 
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'user-photos'
);

-- Política para permitir visualização pública das fotos
CREATE POLICY "Fotos são públicas para visualização" ON storage.objects
FOR SELECT USING (
    bucket_id = 'uploads'
    AND (storage.foldername(name))[1] = 'user-photos'
);

-- Política para permitir atualização de fotos (próprio usuário)
CREATE POLICY "Usuários podem atualizar suas fotos" ON storage.objects
FOR UPDATE USING (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'user-photos'
);

-- Política para permitir exclusão de fotos (próprio usuário)
CREATE POLICY "Usuários podem excluir suas fotos" ON storage.objects
FOR DELETE USING (
    bucket_id = 'uploads'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = 'user-photos'
);

-- 3. Habilitar RLS (Row Level Security) se não estiver habilitado
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 4. Verificação - Liste os buckets criados
SELECT * FROM storage.buckets WHERE id = 'uploads';

-- 5. Verificação - Liste as políticas criadas
SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';