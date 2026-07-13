# Flow 📱

**Flow-Front** é uma aplicação mobile desenvolvida com **React Native** e **Expo**, projetada para oferecer uma experiência de usuário fluida e moderna, conectada a ecossistemas de gestão e fluxos operacionais/financeiros. O projeto utiliza uma arquitetura baseada em componentes modulares e ferramentas de ponta do ecossistema JavaScript/TypeScript.

## 🚀 Tecnologias Utilizadas

- **React Native** (com Expo) — Para o desenvolvimento mobile nativo multiplataforma.
- **TypeScript** — Garantindo tipagem estática segura, redução de bugs e melhor produtividade.
- **Expo** — Framework 
- **Supabase** — Integração com Backend-as-a-Service para autenticação, banco de dados relacional e tempo real.

---

## 🛠️ Funcionalidades

- **Autenticação Segura:** Login, cadastro e persistência de sessão de usuário integrados ao Supabase.
- **Interface Intuitiva:** Componentes customizados focados em Experiência do Usuário (UX/UI).
- **Gestão de Fluxos:** Telas e estados otimizados para acompanhamento de tarefas, dados ou transações.

---

## 🔧 Configuração e Instalação

Siga os passos abaixo para rodar o projeto localmente em sua máquina.

### Pré-requisitos
Certifique-se de ter instalado:
- **Node.js** (versão LTS recomendada)
- Gerenciador de pacotes **npm**, **yarn** ou **pnpm**
- **Expo Go** instalado no seu smartphone (para testes físicos) ou um emulador configurado (Android Studio / Xcode)

### Passo a Passo

1. **Clonar o Repositório:**
   ```bash
   git clone https://github.com/KheZsZz/Flow-Front-.git
   cd Flow-Front-
   ```

2. **Instalar as Dependências:**
   ```bash
   npm install
   # ou com pnpm
   pnpm install
   ```

3. **Configurar as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto e adicione as chaves de configuração do seu projeto Supabase:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=sua_url_do_supabase
   EXPO_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
   ```

4. **Iniciar o Servidor de Desenvolvimento:**
   ```bash
   npx expo start
   ```

5. **Executar no Dispositivo:**
   - Abra o aplicativo **Expo Go** no seu celular e leia o QR Code gerado no terminal.
   - Ou pressione `a` para rodar no Emulador Android ou `i` para o Simulador iOS.

---

## 🧼 Solução de Problemas Comuns

Se encontrar problemas de resolução de módulos, cache antigo do Metro ou componentes não encontrados ao atualizar dependências, limpe o cache do bundler executando:

```bash
npx expo start --clear
```

---

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---
Desenvolvido com 💜 por [Kevin Oliveira](https://github.com/KheZsZz)
