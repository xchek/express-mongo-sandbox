import { MongoClient } from 'mongodb'
import crypto from 'crypto'
import { location, mongoUri } from './config.js'
import _ from 'lodash/fp.js'

let getHash = (s) => crypto.createHash('md5').update(s).digest('hex')

let client = new MongoClient(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

let db = process.env.APP_DB || 'tracker'


export let processRedirect = async (req) => {
  let matched = false
  let trackId = req.params.trackId
  let ret = "https://www.google.com"
  if (typeof trackId !== "string" || trackId.length < 11) {
    return ret
  }
  await client.connect()
    
  let urlsCollection = client.db(db).collection('urls')
  let result = _.head(await urlsCollection.find({trackId: trackId}).toArray())
  
  if (typeof result.url === "string") {
    matched = true
    ret = result.url
  }
  let visits = client.db(db).collection('visits')
  await visits.insertOne({
    headers: req.headers,
    ip: req.ip,
    time: new Date(),
    matched,
    trackId
  })
  return ret
}


export let displayTracking = async (req) => {
  if (typeof req.params.trackId !== "string") {
    return {"Error": "Invalid id parameter!"}
  }
  let trackId = req.params.trackId
  await client.connect()
  let urlsCollection = client.db(db).collection('urls')
  let foundUrlRecord = _.head(await urlsCollection.find({trackId: trackId}).toArray())
  if (typeof foundUrlRecord === "object") {
    let visitsCollection = client.db(db).collection('visits')
    let criteria = {matched: true, trackId: trackId}
    let visitsCount = await visitsCollection.countDocuments(criteria)
    let results = await visitsCollection.find(criteria).toArray()
    let visits = _.mapValues(
      _.map(_.omit(['matched', 'trackId', 'ip'])),
      _.groupBy((x) => x.ip)(results)
    )
    return {
      ...foundUrlRecord,
      hits: visitsCount,
      visits
    }
  } else {
    return {"Error": "Id not found!"}
  }
}


export let processUrl = async (req) => {
  if (req.query.url === undefined) {
    return {error: "Must pass a url parameter."}
  }
  let {ip} = req
  let url = req.query.url
  await client.connect()
  let collection = client.db(db).collection('urls')
  let trackId = getHash(`${ip}|${url}`)
  let record = _.head(await collection.find({trackId: trackId}).toArray())
  if (record === undefined) {
    record = {
      trackId,
      ip,
      url,
      redirectLink: `${location}/l/${trackId}`,
      trackLink: `${location}/z/${trackId}`,
      created: new Date(),
    }
    await collection.insertOne(record)
  }
  return record.trackLink
}

