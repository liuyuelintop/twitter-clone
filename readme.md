## 1. Project SetUp

`npm init -y`

`npm install express mongoose jsonwebtoken bcryptjs dotenv cors cookie-parser cloudinary`

`npm install -D nodemon `

modify `package.json`:

```javascript
"script": {
    "dev": "nodemon backend/server.js",
    "start": "node backend/server.js"
},
...
"type": "module",
...
```

### frontend

`npm create vite@latest . `
