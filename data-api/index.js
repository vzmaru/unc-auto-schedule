const express = require('express')
const app = express()

const port = process.env.PORT

app.get('/', (req, res) => {
  res.send('Hello from Space!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

