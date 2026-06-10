# Compre & Ganhe 013 API

Backend Flask para o MVP do app mobile.

## Rodar localmente

```powershell
cd flask-server
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
pip install -r requirements.txt
flask --app wsgi init-db
flask --app wsgi seed
flask --app wsgi run --host 0.0.0.0 --port 5000
```

O `.env` deve conter `DATABASE_URL`. Opcionalmente defina `JWT_SECRET_KEY`.

Usuário seed:

- `gustavo@email.com`
- senha `123456`

## Rotas principais

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/google`
- `GET /api/me`
- `PATCH /api/me/password`
- `GET /api/restaurants`
- `GET /api/restaurants/<id>`
- `POST /api/restaurants/<id>/favorite`
- `DELETE /api/restaurants/<id>/favorite`
- `POST /api/restaurants/<id>/uses`
