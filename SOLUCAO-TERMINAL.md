# 🔧 Como Corrigir o Terminal no Cursor

## Problema
O terminal está dando erro `ENOENT` (PowerShell não encontrado).

## Soluções

### Solução 1: Usar Scripts .bat (Funciona Sempre)
Os scripts `.bat` funcionam independente do terminal do Cursor:
- Execute `FAZER-TUDO.bat` - Faz tudo automaticamente
- Execute `TESTAR-COMANDOS.bat` - Testa se Git funciona

### Solução 2: Configurar Terminal no Cursor
1. Abra as configurações do Cursor (Ctrl+,)
2. Procure por "terminal integrated shell"
3. Configure para usar `cmd.exe` ao invés de PowerShell:
   - `C:\Windows\System32\cmd.exe`

### Solução 3: Usar Git Bash
1. Instale Git Bash (se não tiver)
2. Configure no Cursor para usar Git Bash como terminal padrão

### Solução 4: Usar VS Code para Git
1. Abra o VS Code
2. Use o Source Control (Ctrl+Shift+G)
3. Faça commit e push visualmente

## Teste Rápido
Execute `CORRIGIR-TERMINAL.bat` para diagnosticar o problema.




