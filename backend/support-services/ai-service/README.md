# Alpha Cinema AI Service

Service nay cung cap chatbox AI cho khach hang voi RAG, PostgreSQL/pgvector, Redis cache, luu hoi thoai va MCP JSON-RPC.

## Chay ha tang

Tu thu muc `backend`:

```bash
docker compose up -d ai-postgres redis
```

PostgreSQL dung image `pgvector/pgvector:pg16`, port mac dinh tren may local la `5433`.

## Chay service

Thu tu local thong thuong:

1. `eureka-server`
2. `config-server`
3. `api-gateway`
4. `ai-service`

`ai-service` lay cau hinh tu Config Server qua `bootstrap.yml`. Neu chay tu IDE, dam bao cac bien trong `.env` duoc nap: `APP_NAME`, `CONFIG_SERVER_URL`, `AI_POSTGRES_*`, `REDIS_*`, `OPENROUTER_*`.

## API chinh

## Nap chinh sach vao VectorDB

Cach nhanh nhat: sua file `src/main/resources/rag/policies.json`. Khi `ai-service` khoi dong lan dau va bang `ai_knowledge_documents` dang rong, service se tu tao bang pgvector va nap toan bo file nay vao VectorDB.

Neu da co du lieu trong DB va muon nap them khong can restart, goi endpoint bulk:

```http
POST /api/ai/knowledge/bulk
Authorization: Bearer <token>
Content-Type: application/json

[
  {
    "title": "Chinh sach doi ve",
    "content": "Noi dung chinh sach...",
    "sourceUrl": "policy://ticket/refund",
    "metadata": "policy,refund"
  }
]
```

Kiem tra tai lieu da vao vectorDB:

```http
GET /api/ai/knowledge/search?query=doi%20ve&limit=5
Authorization: Bearer <token>
```

Chat khach hang:

```http
POST /api/ai/chat
Content-Type: application/json

{
  "conversationId": "optional-conversation-id",
  "message": "Toi muon dat ve nhu the nao?"
}
```

Nap tai lieu vao RAG:

```http
POST /api/ai/knowledge
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Chinh sach doi ve",
  "content": "Noi dung dung de AI truy xuat...",
  "sourceUrl": "admin://policy/refund",
  "metadata": "policy"
}
```

Tim trong vector DB:

```http
GET /api/ai/knowledge/search?query=dat%20ve&limit=5
Authorization: Bearer <token>
```

MCP JSON-RPC:

```http
POST /api/ai/mcp
Authorization: Bearer <token>
Content-Type: application/json

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list",
  "params": {}
}
```

Tool MCP hien co:

- `search_knowledge`: tim tai lieu RAG trong PostgreSQL/pgvector.
- `get_conversation`: lay tin nhan cua mot conversation.
- `get_public_system_context`: truy xuat du lieu public tu product-service, cinema-service va review API neu co.
- `get_customer_system_context`: truy xuat du lieu public va lich su don hang cua dung khach hang dang dang nhap qua `X-User-Id`.

## Phan quyen truy xuat du lieu trong chatbox

- Khach chua dang nhap: chi duoc dung context public gom phim, san pham/combo, rap public, review public neu service co endpoint, va cac chinh sach RAG.
- Khach da dang nhap: duoc dung tat ca context public va them lich su giao dich cua chinh minh tu `order-service /api/orders/my-orders`.
- Gateway van cho `/api/ai/chat` public, nhung neu request co Bearer token thi Gateway se parse token va gan `X-User-Id` cho `ai-service`.
- `ai-service` khong tu lay lich su cua user khac; order history chi duoc goi bang `X-User-Id` do Gateway trich tu JWT.

## Ghi chu

- Neu khong co `OPENROUTER_API_KEY`, service van tra loi fallback dua tren context RAG.
- Redis chi dung de cache ket qua truy xuat RAG; PostgreSQL van la source of truth.
- Bang va extension `vector` duoc tao tu dong khi service khoi dong lan dau.
