# Campus Smart Navigation - Documentação da API

## 📋 Visão Geral

API RESTful para sistema de navegação inteligente do campus, com suporte a múltiplas rotas, preferências de acessibilidade e cálculo inteligente de percursos.

**Base URL:** `https://seu-dominio.com/api`  
**Versão:** 1.0.0

---

## 🔑 Autenticação

Atualmente, a API suporta usuários anônimos. Cada usuário recebe um `userId` único ao criar uma sessão.

Trabalhe em progresso: implementar autenticação JWT para usuários registrados.

---

## 📍 Endpoints

### POI (Pontos de Interesse)

#### 1. Buscar POIs
```
GET /poi/search?query=sala&type=classroom&campus=prédio-a&accessible=true
```

**Query Parameters:**
- `query` (string): Texto para buscar (nome, tipo ou descrição)
- `type` (string): Tipo de POI (classroom, laboratory, library, etc)
- `campus` (string): Campus/prédio específico
- `accessible` (boolean): Apenas POIs acessíveis
- `latitude` (number): Latitude para busca por proximidade
- `longitude` (number): Longitude para busca por proximidade
- `radius` (number): Raio em metros (padrão: 500)

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "id": "poi-001",
      "name": "Sala de Aula 101",
      "type": "classroom",
      "latitude": -21.1596,
      "longitude": -47.8096,
      "is_accessible": true,
      "description": "Sala com acesso para cadeira de rodas"
    }
  ]
}
```

#### 2. Obter Tipos de POI
```
GET /poi/types
```

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "classroom", "label": "Salas de Aula", "icon": "door" },
    { "id": "laboratory", "label": "Laboratórios", "icon": "beaker" }
  ]
}
```

#### 3. Detalhes do POI
```
GET /poi/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "poi-001",
    "name": "Sala de Aula 101",
    "type": "classroom",
    "latitude": -21.1596,
    "longitude": -47.8096,
    "is_accessible": true,
    "amenities": [
      { "amenity_type": "elevator", "details": "Andar 1", "is_available": true },
      { "amenity_type": "ramp", "details": "Entrada principal", "is_available": true }
    ]
  }
}
```

#### 4. POIs Próximos
```
GET /poi/nearby/{latitude}/{longitude}?radius=500
```

---

### 🛣️ Rotas (Routes)

#### 1. Calcular Rota
```
POST /routes/calculate
```

**Request Body:**
```json
{
  "start": {
    "latitude": -21.1596,
    "longitude": -47.8096
  },
  "end": {
    "latitude": -21.1600,
    "longitude": -47.8100
  },
  "preferences": {
    "routeType": "balanced",
    "wheelchairAccessible": false,
    "avoidStairs": false,
    "requireElevator": false,
    "mobilitySpeed": 1.0,
    "language": "pt-BR"
  },
  "userId": "user-123"
}
```

**Preference Options:**
- `routeType`: "fastest" | "safest" | "accessible" | "scenic" | "balanced"
- `mobilitySpeed`: 0.5 (lento) até 2.0 (rápido)
- `language`: "pt-BR" | "en-US" | "es-ES"

**Response:**
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "route-001",
        "name": "Rota Balanceada",
        "distance": 250,
        "estimatedTime": 3,
        "estimatedTimeAdjusted": 4,
        "difficulty": "low",
        "accessibilityScore": 8,
        "safetyScore": 7,
        "steps": [
          {
            "instruction": "Caminhe em direção a Leste por 150m",
            "distance": 150,
            "duration": 2
          }
        ],
        "accessibility": {
          "hasElevators": false,
          "hasRamps": true,
          "hasWheelchairAccess": true
        }
      }
    ],
    "startPoint": { "latitude": -21.1596, "longitude": -47.8096 },
    "endPoint": { "latitude": -21.1600, "longitude": -47.8100 }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### 2. Comparar Rotas
```
POST /routes/compare
```

**Request Body:**
```json
{
  "start": { "latitude": -21.1596, "longitude": -47.8096 },
  "end": { "latitude": -21.1600, "longitude": -47.8100 }
}
```

**Response:** Retorna 4 tipos de rotas (fastest, safest, accessible, scenic)

#### 3. Calcular Distância
```
GET /routes/distance?startLat=-21.1596&startLng=-47.8096&endLat=-21.1600&endLng=-47.8100
```

**Response:**
```json
{
  "success": true,
  "data": {
    "distance": {
      "meters": 563,
      "kilometers": "0.56"
    },
    "estimatedTime": {
      "minutes": 7,
      "formatted": "0h 7min"
    },
    "direction": "Sudeste"
  }
}
```

#### 4. Estimar Tempo
```
GET /routes/time?distance=500&mobilitySpeed=1.0
```

#### 5. Registrar Feedback
```
POST /routes/feedback
```

**Request Body:**
```json
{
  "routeId": "route-001",
  "userId": "user-123",
  "rating": 4,
  "feedback": "Rota excelente, bem sinalizada",
  "actualTime": 5,
  "issues": ["construção na rota"]
}
```

---

### 👤 Usuários (Users)

#### 1. Criar Usuário
```
POST /users
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "João Silva",
  "is_anonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": "user-123",
    "is_anonymous": false,
    "preferences": { ... }
  }
}
```

#### 2. Obter Perfil
```
GET /users/{userId}
```

#### 3. Atualizar Preferências
```
PUT /users/{userId}/preferences
```

**Request Body:**
```json
{
  "wheelchairAccessible": true,
  "mobilitySpeed": 0.8,
  "routeType": "accessible",
  "theme": "high-contrast"
}
```

#### 4. Atualizar Perfil de Acessibilidade
```
PUT /users/{userId}/accessibility
```

**Request Body:**
```json
{
  "mobilityLimitation": true,
  "visualImpairment": false,
  "hearingImpairment": false,
  "cognitiveDisability": false,
  "custom_needs": "Preciso de rampas e elevadores"
}
```

#### 5. Salvar Rota Favorita
```
POST /users/{userId}/favorites
```

**Request Body:**
```json
{
  "name": "Sala 101 → Biblioteca",
  "start_location": { "latitude": -21.1596, "longitude": -47.8096 },
  "end_location": { "latitude": -21.1600, "longitude": -47.8100 },
  "route_data": { ... }
}
```

#### 6. Obter Rotas Favoritas
```
GET /users/{userId}/favorites
```

#### 7. Registrar Navegação
```
POST /users/{userId}/navigation-log
```

**Request Body:**
```json
{
  "start_location": { "latitude": -21.1596, "longitude": -47.8096 },
  "end_location": { "latitude": -21.1600, "longitude": -47.8100 },
  "route_used": "route-001",
  "actual_time": 5,
  "feedback": "Rota ótima"
}
```

#### 8. Atualizar Último Acesso
```
POST /users/{userId}/active
```

#### 9. Obter Estatísticas
```
GET /users/{userId}/stats
```

---

## ⚙️ Configuração

### Variáveis de Ambiente

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_KEY=sua-chave-publica

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173,https://seu-dominio.vercel.app
```

### Instalação

```bash
# Instalar dependências
npm install

# Iniciar em desenvolvimento
npm run dev

# Iniciar em produção
npm start
```

---

## 🗄️ Estrutura do Banco de Dados

### Tabelas Necessárias (Supabase)

**points_of_interest**
```sql
- id: UUID
- name: TEXT
- type: TEXT
- description: TEXT
- latitude: DECIMAL
- longitude: DECIMAL
- campus: TEXT
- is_accessible: BOOLEAN
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

**poi_amenities**
```sql
- id: UUID
- poi_id: UUID (FK)
- amenity_type: TEXT
- details: TEXT
- is_available: BOOLEAN
```

**users**
```sql
- id: UUID
- email: TEXT
- name: TEXT
- is_anonymous: BOOLEAN
- preferences: JSONB
- accessibility_profile: JSONB
- created_at: TIMESTAMP
- last_active_at: TIMESTAMP
```

**saved_routes**
```sql
- id: UUID
- user_id: UUID (FK)
- name: TEXT
- start_location: JSONB
- end_location: JSONB
- route_data: JSONB
- is_favorite: BOOLEAN
- created_at: TIMESTAMP
```

**navigation_history**
```sql
- id: UUID
- user_id: UUID (FK)
- start_location: JSONB
- end_location: JSONB
- route_used: TEXT
- actual_time: INTEGER
- feedback: TEXT
- created_at: TIMESTAMP
```

---

## 🔄 Fluxos Principais

### Fluxo 1: Buscar Rota Inteligente
1. **POST /users** → Criar usuário anônimo
2. **GET /poi/search** → Buscar ponto de destino
3. **POST /routes/calculate** → Calcular rota com preferências
4. **POST /users/{userId}/navigation-log** → Registrar navegação

### Fluxo 2: Usuário Registrado com Preferências
1. **POST /users** → Criar usuário registrado
2. **PUT /users/{userId}/accessibility** → Definir perfil de acessibilidade
3. **PUT /users/{userId}/preferences** → Salvar preferências
4. **GET /users/{userId}/favorites** → Rotas favoritas salvas

---

## 📊 Códigos de Status HTTP

- **200**: Sucesso
- **201**: Recurso criado
- **400**: Erro de validação
- **404**: Recurso não encontrado
- **500**: Erro interno do servidor

---

## 🛡️ Tratamento de Erros

Todos os erros retornam no seguinte formato:

```json
{
  "error": true,
  "message": "Descrição do erro",
  "stack": "..." // Apenas em desenvolvimento
}
```

---

## 📝 Exemplos com cURL

### Buscar Salas de Aula
```bash
curl -X GET "http://localhost:3000/api/poi/search?query=sala&type=classroom" \
  -H "Content-Type: application/json"
```

### Calcular Rota
```bash
curl -X POST "http://localhost:3000/api/routes/calculate" \
  -H "Content-Type: application/json" \
  -d '{
    "start": {"latitude": -21.1596, "longitude": -47.8096},
    "end": {"latitude": -21.1600, "longitude": -47.8100},
    "preferences": {"routeType": "accessible", "wheelchairAccessible": true}
  }'
```

### Criar Usuário
```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "Content-Type: application/json" \
  -d '{"is_anonymous": true}'
```

---

## 🚀 Deploy

### Vercel
O projeto está pré-configurado para deploy no Vercel.

```bash
vercel
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Suporte

Para dúvidas ou problemas, abra uma issue no repositório do projeto.
