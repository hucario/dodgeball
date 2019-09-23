const express = require('express');
const layouts = require('express-ejs-layouts');

const app = express()
const port = process.env.PORT

app.set('view engine', 'ejs');
 
app.use(expressLayouts);


app.get('/', (req, res) => {
  res.send('Hello World!');
  console.log('sent thing :)');

})

app.listen(port, () => {
  console.log(`Example app listening on port `+port+`!`)
})
