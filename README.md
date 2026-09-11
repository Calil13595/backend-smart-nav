# 🗺️ Campus Smart Navigation - Backend

![UNAERP](https://img.shields.io/badge/UNAERP-22º%20Desafio-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![Express](https://img.shields.io/badge/Express-4.18+-yellow)
![Supabase](https://img.shields.io/badge/Supabase-Database-lightblue)

Sistema inteligente de navegação do campus com suporte a acessibilidade, múltiplas rotas e preferências personalizadas.

## 🎯 Objetivo

Desenvolver uma aplicação web acessível que permita:
- ✅ Busca inteligente de pontos de interesse
- ✅ Cálculo de múltiplas rotas (rápida, segura, acessível, cenográfica)
- ✅ Adaptação para diferentes necessidades de mobilidade
- ✅ Histórico de navegação e rotas favoritas
- ✅ Feedback e avaliação de rotas

## 🏗️ Arquitetura

```
Backend (Node.js)
    ↓
  APIs RESTful
    ↓
Serviços de Negócio
    ├─ POI Service
    ├─ Route Service
    └─ User Service
    ↓
Supabase (Database)
```

## 🚀 Começando

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Conta no Supabase

### Instalação

1. **Clone o repositório**
```bash
git clone https://github.com/seu-usuario/campus-smart-navigation.git
cd campus-smart-navigation/backend
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
```

Edite `.env` com suas credenciais Supabase:
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica
PORT=3000
NODE_ENV=development
```

4. **Inicie o servidor**
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Estrutura do Projeto

```
src/
├── config/
│   └── supabase.js           # Configuração do Supabase
├── middleware/
│   └── errorHandler.js       # Tratamento centralizado de erros
├── services/
│   ├── poi.service.js        # Serviço de Pontos de Interesse
│   ├── route.service.js      # Serviço de Cálculo de Rotas
│   └── user.service.js       # Serviço de Usuários
├── routes/
│   ├── poi.routes.js         # Endpoints de POI
│   ├── route.routes.js       # Endpoints de Rotas
│   └── user.routes.js        # Endpoints de Usuários
└── index.js                  # Arquivo principal
```

## 🔌 Endpoints Principais

### 📍 Pontos de Interesse
- `GET /api/poi/search` - Buscar POIs
- `GET /api/poi/types` - Listar tipos de POI
- `GET /api/poi/:id` - Detalhes do POI
- `GET /api/poi/nearby/:lat/:lng` - POIs próximos

### 🛣️ Rotas
- `POST /api/routes/calculate` - Calcular rota
- `POST /api/routes/compare` - Comparar rotas
- `GET /api/routes/distance` - Calcular distância
- `GET /api/routes/time` - Estimar tempo

### 👤 Usuários
- `POST /api/users` - Criar usuário
- `GET /api/users/:id` - Obter perfil
- `PUT /api/users/:id/preferences` - Atualizar preferências
- `GET /api/users/:id/favorites` - Rotas favoritas

## 📊 Base de Dados

O projeto usa **Supabase** como banco de dados. As tabelas necessárias são:

- `points_of_interest` - Locais do campus
- `poi_amenities` - Amenidades de acessibilidade
- `users` - Perfis de usuário
- `saved_routes` - Rotas favoritas
- `navigation_history` - Histórico de navegações

Veja `API_DOCUMENTATION.md` para detalhes do schema.

## 🎨 Algoritmos de Rota

### Cálculo de Distância
Utiliza a **fórmula de Haversine** para calcular a distância entre dois pontos:
```javascript
distance = 2 * R * arcsin(sqrt(sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)))
```

### Tipos de Rota
1. **Fastest** - Rota mais rápida (distância mínima)
2. **Safest** - Rota mais segura (iluminação, movimento)
3. **Accessible** - Rota acessível (rampas, elevadores)
4. **Scenic** - Rota cenográfica (parques, áreas agradáveis)
5. **Balanced** - Balanço entre velocidade, segurança e acessibilidade

### Score de Acessibilidade
```
Score = (hasWheelchairAccess * 3) + (hasRamps * 2) + (hasElevators * 2) 
        + (hasBrailleSignage * 1) + (!hasStairs * 2) + (wellLit * 1)
```

## 🔐 Segurança

- ✅ CORS configurável por ambiente
- ✅ Validação de entrada em todos os endpoints
- ✅ Tratamento centralizado de erros
- ✅ Uso de variáveis de ambiente para credenciais
- 🔄 TODO: Autenticação JWT para usuários registrados

## 📈 Performance

- Cache de rotas pré-calculadas
- Queries otimizadas no Supabase
- Índices em campos de busca frequente
- Paginação nos resultados

## 🧪 Testes

```bash
npm test
```

(Em desenvolvimento)

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SUPABASE_URL` | URL do projeto Supabase | `https://abc.supabase.co` |
| `SUPABASE_KEY` | Chave pública Supabase | `eyJh...` |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente | `development` ou `production` |
| `CORS_ORIGIN` | URLs permitidas | `http://localhost:5173` |

## 🚀 Deploy

### Vercel

1. **Conecte seu repositório ao Vercel**
```bash
vercel
```

2. **Configure as variáveis de ambiente no Vercel Dashboard**

3. **Deploy automático a cada push para `main`**

### Docker

```bash
docker build -t campus-nav-api .
docker run -p 3000:3000 --env-file .env campus-nav-api
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📦 Stack Tecnológico

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js 4.18+
- **Database:** Supabase (PostgreSQL)
- **Client:** @supabase/supabase-js
- **HTTP:** Axios

### Ferramentas
- **Dev:** Nodemon
- **Testing:** Jest
- **Linting:** ESLint (configuração pendente)
- **Formatter:** Prettier (configuração pendente)

## 🗺️ Roadmap

- [x] API básica de POI
- [x] Cálculo de rotas
- [x] Serviço de usuários
- [x] Preferências de acessibilidade
- [ ] Autenticação JWT
- [ ] Testes automatizados
- [ ] Rate limiting
- [ ] Cache Redis
- [ ] WebSocket para navegação em tempo real
- [ ] Integração com Google Maps API
- [ ] Analytics e relatórios

## 📄 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## 📞 Contato

**UNAERP - 22º Desafio da Engenharia da Computação**
- Email: desafio@unaerp.br
- Site: https://www.unaerp.br

## 🙏 Agradecimentos

- UNAERP pelo desafio e oportunidade
- Supabase pela infraestrutura de banco de dados
- Vercel pelo hosting

---

**Desenvolvido com ❤️ para acessibilidade universal**
