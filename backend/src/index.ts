import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { initRecommend, queryRecommend } from './recommend.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})
app.get('/recommend-nutrient', (req) => {
  return req.text('Hello world')
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  initRecommend();
  console.log(`Server is running on http://localhost:${info.port}`)
  
})
