import 'dotenv/config'
import express from 'express'
import http from 'node:http'
import cors from 'cors'
import session from 'express-session'
import { Server } from 'socket.io'
import authRoutes from './routes/authRoutes.js'
import {
  createRoom,
  handleDisconnect,
  joinRoom,
  listPublicRooms,
} from './rooms.js'

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
      secure: false,
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

function broadcastRooms() {
  io.emit('rooms:updated', listPublicRooms())
}

io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`)
  socket.emit('rooms:updated', listPublicRooms())

  socket.on('room:create', (payload, acknowledge) => {
    const result = createRoom(socket, payload)

    if (typeof acknowledge === 'function') {
      acknowledge(result)
    }

    if (!result.error) {
      broadcastRooms()
    }
  })

  socket.on('room:join', (payload, acknowledge) => {
    const result = joinRoom(socket, payload)

    if (typeof acknowledge === 'function') {
      acknowledge(result)
    }

    if (!result.error) {
      broadcastRooms()
    }
  })

  socket.on('disconnect', () => {
    const leftRoom = handleDisconnect(socket)
    console.log(`Player disconnected: ${socket.id}`)

    if (leftRoom) {
      broadcastRooms()
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
