# 📸 Como Adicionar a Logo

## Passos:

1. **Coloque sua logo** na pasta `public/` com o nome `logo.png`

2. **Formatos aceitos**: `.png`, `.jpg`, `.svg`, `.webp`

3. **Se usar outro formato**, edite `components/header.tsx`:
   ```tsx
   // Linha 11: Altere a extensão
   <img 
     src="/logo.jpg"  // ou .svg, .webp
     alt="Cultura Builder Logo" 
     className="h-12 w-auto object-contain"
   />
   ```

4. **Ajustar tamanho** (se necessário):
   ```tsx
   // Altere h-12 para o tamanho desejado:
   className="h-16 w-auto"  // maior
   className="h-10 w-auto"  // menor
   ```

5. **Commit e Push**:
   ```bash
   cd "C:\Dev\dash comercial"
   git add public/logo.png
   git commit -m "Add: Logo da empresa"
   git push
   ```

## Resultado:
A logo aparecerá no header de todas as páginas! ✨

