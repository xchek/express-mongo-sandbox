export let port = process.env.PORT || 3000

export let location = `http://localhost:${port}`

export let mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017'
