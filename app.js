const path = require('path')
const express = require('express')
const exphbs = require('express-handlebars')
const app = express()
const bodyParser = require("body-parser");
const got = require('got');

// parser for application/x-www-form-urlencoded
const urlencodedParser = bodyParser.urlencoded({ extended: false });

app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  extname: '.hbs',
  layoutsDir: path.join(__dirname, 'views/layouts')
}))

app.set('view engine', '.hbs')
app.set('views', path.join(__dirname, 'views'))

app.get('/', urlencodedParser, (request, response) => {
  response.render('home', {
    words: ''
  });
});

app.post('/find', urlencodedParser, async (request, response) => {
  if (!request.body) return response.sendStatus(400);

  let words = request.body.words.split(/\r?\n/);
  let examples = [];

  for (let i = 0; i < words.length; i++) {
    try {
      const word = words[i];
      const jsonData = await findExamples(word);
      examples.push({ word: word, sentences: jsonData.data.exampleSentences.map(x => x.sentence.replace(new RegExp(word, 'gi'), `<b>${word}</b>`)) });
    }
    catch (error) {
      console.log(error.response.body);
    }
  }

  console.log(examples);

  response.render('home', {
    words: request.body.words,
    examples: examples
  });
});

app.listen(3000)

async function findExamples(word) {
  // https://www.thesaurus.com
  const data = await got(`https://tuna.thesaurus.com/pageData/${word}`);
  console.log(data.body);
  const jsonData = JSON.parse(data.body);
  return jsonData;
}
