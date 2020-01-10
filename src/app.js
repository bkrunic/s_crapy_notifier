const express = require('express')
const port = process.env.PORT
const userRouter = require('./routes/userRoute')
const dataRouter = require('./routes/dataRoute')
require('./db/db')

const app = express()

app.use(express.json())
app.use(userRouter)
app.use(dataRouter)

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
})
