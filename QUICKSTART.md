# 🚀 Campus Smart Navigation - Quick Start Guide

## ⚡ Setup em 5 Minutos

### 1️⃣ Pré-requisitos
```bash
# Verificar Node.js
node --version  # Precisa ser 18+
npm --version
```

### 2️⃣ Clonar e Instalar
```bash
cd seu-projeto
npm install
```

### 3️⃣ Configurar Supabase
- Vá para [supabase.com](https://supabase.com)
- Crie um novo projeto
- Copie a URL e a chave pública
- Execute o script SQL em `DATABASE_SETUP.sql` no SQL Editor

### 4️⃣ Variáveis de Ambiente
```bash
cp .env.example .env
```

Edite `.env`:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

### 5️⃣ Iniciar Servidor
```bash
npm run dev
```

✅ API rodando em `http://localhost:3000`

---

## 🧪 Testar a API

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Criar Usuário Anônimo
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"is_anonymous": true}'
```

### Buscar Salas de Aula
```bash
curl "http://localhost:3000/api/poi/search?query=sala&type=classroom"
```

### Calcular Rota
```bash
curl -X POST http://localhost:3000/api/routes/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "start": {"latitude": -21.1596, "longitude": -47.8096},
    "end": {"latitude": -21.1600, "longitude": -47.8100},
    "preferences": {"routeType": "accessible"}
  }'
```

---

## 📁 Estrutura de Arquivos

```
campus-smart-navigation/
├── src/
│   ├── config/
│   │   └── supabase.js          # Configuração do Supabase
│   ├── middleware/
│   │   └── errorHandler.js      # Tratamento de erros
│   ├── services/
│   │   ├── poi.service.js       # Lógica de POI
│   │   ├── route.service.js     # Lógica de rotas
│   │   └── user.service.js      # Lógica de usuários
│   ├── routes/
│   │   ├── poi.routes.js        # Endpoints POI
│   │   ├── route.routes.js      # Endpoints Rotas
│   │   └── user.routes.js       # Endpoints Usuários
│   └── index.js                 # Servidor principal
├── .env.example                 # Variáveis de ambiente
├── package.json                 # Dependências
├── vercel.json                  # Config Vercel
├── DATABASE_SETUP.sql           # Schema do banco
├── API_DOCUMENTATION.md         # Documentação completa
├── README.md                    # Guia do projeto
└── QUICKSTART.md               # Este arquivo
```

---

## 📚 Documentação Completa

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Todos os endpoints explicados
- **[README.md](./README.md)** - Visão geral do projeto
- **[EXAMPLE_CLIENT.js](./EXAMPLE_CLIENT.js)** - Como usar a API em JavaScript

---

## 🔌 Endpoints Principais

### POI (Pontos de Interesse)
```
GET    /api/poi/search          # Buscar POIs
GET    /api/poi/types           # Listar tipos
GET    /api/poi/:id             # Detalhes
GET    /api/poi/nearby/:lat/:lng # Próximos
POST   /api/poi                 # Criar (admin)
PUT    /api/poi/:id             # Atualizar (admin)
```

### Rotas
```
POST   /api/routes/calculate    # Calcular rota
POST   /api/routes/compare      # Comparar rotas
GET    /api/routes/distance     # Calcular distância
GET    /api/routes/time         # Estimar tempo
POST   /api/routes/feedback     # Enviar feedback
```

### Usuários
```
POST   /api/users                        # Criar usuário
GET    /api/users/:id                    # Obter perfil
PUT    /api/users/:id/preferences       # Atualizar preferências
PUT    /api/users/:id/accessibility     # Atualizar acessibilidade
POST   /api/users/:id/favorites         # Salvar favorita
GET    /api/users/:id/favorites         # Listar favoritas
POST   /api/users/:id/navigation-log    # Registrar navegação
GET    /api/users/:id/stats             # Estatísticas
```

---

## 🚀 Deploy no Vercel

### 1. Conectar repositório
```bash
vercel
```

### 2. Configurar variáveis de ambiente
No Vercel Dashboard:
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `CORS_ORIGIN`

### 3. Deploy automático
```bash
git push  # Vercel faz deploy automaticamente
```

---

## 🐛 Troubleshooting

### Erro: "SUPABASE_URL e SUPABASE_KEY são obrigatórios"
✅ Verifique se `.env` tem as variáveis corretas

### Erro: "Cannot POST /api/routes/calculate"
✅ Certifique-se de que o servidor está rodando: `npm run dev`

### Erro: "CORS error"
✅ Atualize `CORS_ORIGIN` em `.env` com a URL do frontend

### Banco de dados vazio
✅ Execute o script SQL em `DATABASE_SETUP.sql` no Supabase

---

## 📞 Próximos Passos

- [ ] Integrar com frontend React/Vue
- [ ] Implementar autenticação JWT
- [ ] Adicionar testes unitários
- [ ] Integrar Google Maps API para mapas
- [ ] Implementar WebSocket para navegação em tempo real
- [ ] Adicionar cache Redis
- [ ] Configurar rate limiting

---

## 💡 Dicas

- Use `console.log()` para debugar em desenvolvimento
- Teste com Insomnia, Postman ou cURL
- Verifique os logs do Supabase no dashboard
- Use `npm run dev` com nodemon para auto-reload

---

## 📞 Suporte

Dúvidas? Abra uma issue no repositório ou entre em contato com o time UNAERP!

**Boa sorte! 🎯**
