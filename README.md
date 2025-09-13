# Aposta Fácil 🎲

Uma plataforma moderna e intuitiva para criar e participar de apostas online com amigos. Desenvolvida com Next.js e Tailwind CSS, utilizando o Supabase como banco de dados e para autenticação.

## 🚀 Como Usar

### 1. Visualizando Apostas
![Tela Principal - Visualização de Apostas](public/images/2025-05-03%2017_38_17-.png)

Na tela inicial, você pode ver todas as apostas ativas. Aqui você pode:
- Visualizar todas as apostas disponíveis
- Ver detalhes como valor, data de encerramento e número de participantes
- Participar de qualquer aposta clicando nela
- Compartilhar apostas com amigos

### 2. Login e Criação
![Tela Principal - Usuário Logado](public/images/2025-05-03%2017_38_38-.png)

Para criar suas próprias apostas:
1. Clique em "Entrar com Google" no canto superior direito
2. Após o login, o botão "Criar Nova Aposta" aparecerá
3. Agora você tem acesso a todas as funcionalidades de criação

### 3. Criando uma Nova Aposta
![Criação de Aposta](public/images/2025-05-03%2017_38_44-.png)

No formulário de criação, você pode:
- Definir um título e descrição para sua aposta
- Estabelecer o valor que cada participante deve pagar
- Escolher a data de encerramento
- Adicionar quantas opções desejar (mínimo de 2)
- Personalizar cada opção da aposta

### 4. Gerenciando sua Aposta
![Detalhes da Aposta](public/images/2025-05-03%2017_38_54-.png)

Após criar a aposta, você terá acesso a:
- Link para compartilhar com amigos
- Acompanhamento em tempo real das apostas
- Lista de participantes e suas escolhas
- Opção para finalizar a aposta quando chegar a data
- Cálculo automático dos valores para os ganhadores

## ✨ Funcionalidades

### Para Todos os Usuários
- Visualização de todas as apostas ativas
- Participação em apostas existentes
- Interface intuitiva e responsiva
- Compartilhamento fácil via WhatsApp e outras redes

### Para Usuários Logados
- Criação de novas apostas personalizadas
- Gerenciamento de apostas criadas
- Finalização de apostas com definição de ganhadores
- Cálculo automático de valores para os ganhadores

## 🛠️ Tecnologias

- **Frontend**: Next.js 14, React, Tailwind CSS
- **Backend e Autenticação**: Supabase (PostgreSQL + Auth)
- **Deploy**: Vercel
- **Login**: Supabase Auth com Google OAuth

## 🌐 Acesse em

[Aposta Fácil](https://apostafacil.vercel.app)

## 🔒 Privacidade e Segurança

- Autenticação segura via Google
- Dados protegidos no Supabase
- Sem armazenamento de informações sensíveis
- Transações transparentes e rastreáveis

## 📱 Responsividade

A plataforma é totalmente responsiva, funcionando perfeitamente em:
- Desktops
- Tablets
- Smartphones

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## Configuração do Ambiente

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/apostafacil.git
cd apostafacil
```

2. Instale as dependências:
```bash
npm install
```

3. Copie o arquivo `.env.example` para `.env.local`:
```bash
cp .env.example .env.local
```

4. Preencha as variáveis de ambiente no arquivo `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: URL do seu projeto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Chave anônima do Supabase

## Desenvolvimento

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Acesse [http://localhost:3000](http://localhost:3000) no seu navegador

## Estrutura do Projeto

```
src/
├── app/                    # Rotas da aplicação
│   ├── api/               # API Routes
│   ├── bet/              # Página de apostas
│   ├── create-bet/       # Página de criação
│   └── page.tsx          # Home page
├── lib/                   # Utilitários
│   └── storage.ts        # Acesso ao Supabase
└── types/                # Definições de tipos
    └── bet.ts           # Tipos de apostas
```

## Notas

- Este é um MVP que utiliza o Supabase para armazenar dados e realizar a autenticação.
- Os pagamentos ainda não são processados automaticamente.
- O criador da aposta é responsável por coletar e distribuir os valores.

## Build

```bash
npm run build
```

## Deploy

O projeto está configurado para deploy na Vercel. Certifique-se de configurar as variáveis de ambiente no painel da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
