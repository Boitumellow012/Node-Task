# 🎬 Node.js Media Server

A lightweight RESTful Node.js server for managing media content (movies, series, and songs). It supports CRUD operations via JSON APIs and includes control commands to gracefully shut down or restart the server.

---

## 🚀 Run the Server

```bash
node server.js
```

---
## 🚀 Run in the browser

```bash
http://localhost:3000
http://localhost:3000/movies
http://localhost:3000/series 
http://localhost:3000/songs 
```

## 🌐 API Endpoints

### 📁 Media Routes

| Method | Endpoint   | Description              |
|--------|------------|--------------------------|
| GET    | /movies    | Fetch all movies         |
| POST   | /movies    | Add a new movie          |
| PUT    | /movies    | Update an existing movie |
| DELETE | /movies    | Delete a movie           |

Similar routes are available for:

- `/series`
- `/songs`

> **Note:** `GET`, `POST`, `PUT`, and `DELETE` methods require a JSON body.

---

## 📥 Example GET Request

```http
GET /movies
Content-Type: application/json

{
    "id": 1,
    "title": "The Batman",
    "genre": "Action",
    "director": "Matt Reeves",
    "year": 2022,
    "rating": 7.9
  }
```

---

## 📄 License

MIT License
