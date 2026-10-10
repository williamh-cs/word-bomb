import 'dotenv/config'
import express from 'express'
import http from 'node:http'
import cors from 'cors'
import session from 'express-session'
import { Server } from 'socket.io'
import authRoutes from './routes/authRoutes.js'

const app = express()
const httpServer = http.createServer(app)

const PORT = process.env.PORT || 3000
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
)
app.use(express.json())
app.use(
  session({
    name: 'wordbomb.sid',
    secret: process.env.SESSION_SECRET || 'wordbomb-dev-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  }),
)

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Word Bomb server is running!',
  })
})

app.use('/api/auth', authRoutes)

const io = new Server(httpServer, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
  },
})

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`)

  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`)
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
