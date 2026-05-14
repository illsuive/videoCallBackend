import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import cookieParser from 'cookie-parser'
import ConnectToDb from './db/db.js'

import authRouter from './MVC/routes/auth.route.js'
import userRouter from './MVC/routes/user.route.js'
import chatRouter from './MVC/routes/chat.route.js'

const app = express()

app.use(cookieParser())

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
  methods : ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/chat', chatRouter)

app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on http://localhost:${process.env.PORT || 3000}`)
  ConnectToDb()
})
