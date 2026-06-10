# Compre & Ganhe 013

MVP mobile para acompanhar o uso do livrinho fisico de promocoes.

## Stack

- Mobile: React Native + Expo + TypeScript
- Backend: Python + Flask
- Banco: PostgreSQL
- Auth: JWT Bearer
- Storage futuro: Supabase Storage, S3 ou equivalente

## Estrutura

```text
flask-server/  API Flask, modelos SQLAlchemy, seed e rotas JWT
mobile/        App Expo com login, home, explorar/mapa, detalhe e conta
```

## Backend

```powershell
cd flask-server
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
flask --app wsgi init-db
flask --app wsgi seed
flask --app wsgi run --host 0.0.0.0 --port 5000
```

Usuario seed:

- `gustavo@email.com`
- senha `123456`

## Mobile

```powershell
cd mobile
npm install
$env:EXPO_PUBLIC_API_URL='http://127.0.0.1:5000/api'
npm run web
```

O app tambem tem fallback local de dados ficticios quando a API nao esta acessivel.
