# Aposta Fácil

Uma plataforma web simples para criar e participar de apostas entre amigos. Sem autenticação, sem pagamentos, apenas diversão!

🔗 Acesse em: [https://apostafacil.vercel.app/](https://apostafacil.vercel.app/)

## Funcionalidades

- Criar apostas com opções personalizadas
- Compartilhar apostas via link único
- Participar de apostas sem necessidade de cadastro
- Visualizar resultados em tempo real
- Interface responsiva para mobile

## Tecnologias

- Next.js 14
- TypeScript
- Tailwind CSS
- React

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
│   └── storage.ts        # Armazenamento em memória
└── types/                # Definições de tipos
    └── bet.ts           # Tipos de apostas
```

## Notas

- Este é um MVP e usa armazenamento em memória. Em produção, recomenda-se usar um banco de dados.
- Não há autenticação ou pagamentos reais.
- O criador da aposta é responsável por coletar e distribuir os valores.

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## Licença

MIT

## Build

```bash
npm run build
```

## Deploy

O projeto está configurado para deploy na Vercel. Certifique-se de configurar as variáveis de ambiente no painel da Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
