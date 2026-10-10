import { Router } from 'express'
import argon2 from 'argon2'
import db from '../db.js'

const router = Router()

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,30}$/

function setUserSession(req, user) {
  req.session.user = {
    id: user.id,
    username: user.username,
  }
}

router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body ?? {}

    if (typeof username !== 'string' || !USERNAME_REGEX.test(username)) {
      return res.status(400).json({
        error:
          'Username must be 3–30 characters using letters, numbers, or underscores.',
      })
    }

    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      Buffer.byteLength(password, 'utf8') > 1024
    ) {
      return res.status(400).json({
        error:
          'Password must be at least 8 characters and no more than 1024 bytes.',
      })
    }

    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
    })

    const [user] = await db('users')
      .insert({
        username,
        password_hash: passwordHash,
      })
      .returning(['id', 'username', 'created_at'])

    setUserSession(req, user)

    return res.status(201).json({
      message: 'Account created successfully.',
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        error: 'That username is already taken.',
      })
    }

    console.error('Registration error:', error.message)

    return res.status(500).json({
      error: 'Could not create account.',
    })
  }
})

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body ?? {}

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      password.length === 0 ||
      Buffer.byteLength(password, 'utf8') > 1024
    ) {
      return res.status(400).json({
        error: 'Enter a valid username and password.',
      })
    }

    const user = await db('users').where({ username }).first()

    if (!user || !(await argon2.verify(user.password_hash, password))) {
      return res.status(401).json({
        error: 'Invalid username or password.',
      })
    }

    setUserSession(req, user)

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
      },
    })
  } catch (error) {
    console.error('Login error:', error.message)

    return res.status(500).json({
      error: 'Could not log in.',
    })
  }
})

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated.' })
  }

  return res.status(200).json({ user: req.session.user })
})

router.post('/signout', (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      console.error('Signout error:', error.message)
      return res.status(500).json({ error: 'Could not sign out.' })
    }

    res.clearCookie('wordbomb.sid')
    return res.status(200).json({ message: 'Signed out.' })
  })
})

export default router
