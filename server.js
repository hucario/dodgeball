const express = require('express')
const app = express()
const port = $PORT

app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('sent thing :)');

})

app.listen(port, () => {
  console.log(`Example app listening on port '+port+'!`)
})
