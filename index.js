import express from 'express'
import logger from './logging.js'
import { processUrl, processRedirect, displayTracking } from './app.js'
import { port, location } from './config.js'

let app = express()

app.use(logger)


//TODO: Add caching with redis for trackId:url to make this faster!
app.get('/l/:trackId', async (req, res) => {
  res.redirect(await processRedirect(req))
})

app.get('/z/:trackId', async (req, res) => {
  res.json(await displayTracking(req))
})

app.get('/track', async (req, res) => {
  res.redirect(await processUrl(req))
})

app.get('/', (req, res) => {
  res.json({
    availableEndpoints: [
      {
        "url": `${location}/track`,
        "params": {'url': 'Url to redirect tracked visits to.'},
        "description": "Generate redirect links - provide link to track visits."
      },
      {
        'url': `${location}/`,
        "description": "Displays this menu."
      }
    ]
  })
})


app.listen(port, () => {
  console.log(`Test app listening at ${location}`)
})
