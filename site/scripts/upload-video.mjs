import {createClient} from '@sanity/client'
import {createReadStream, statSync} from 'node:fs'
import {basename} from 'node:path'

// Uploads a local video (or any file) to Sanity's asset store and prints the
// CDN URL. Sanity's file CDN (cdn.sanity.io/files/...) supports HTTP Range
// requests, so <video> scrubbing works — unlike Cloudflare Workers static
// assets, which serve the whole file with a 200 and no Accept-Ranges.
//
// Usage:
//   SANITY_API_TOKEN=xxx node site/scripts/upload-video.mjs site/src/assets/franchisor-explainer.mp4

const filePath = process.argv[2]
if (!filePath) {
  console.error('Usage: node site/scripts/upload-video.mjs <path-to-file>')
  process.exit(1)
}

const env = {
  projectId: process.env.SANITY_PROJECT_ID || '4kjxjblw',
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2025-01-01',
  token: process.env.SANITY_API_TOKEN,
}

if (!env.token) {
  console.error('Missing SANITY_API_TOKEN (needs asset write access).')
  console.error('Create one at https://manage.sanity.io -> API -> Tokens (Editor role).')
  process.exit(1)
}

const client = createClient({
  projectId: env.projectId,
  dataset: env.dataset,
  apiVersion: env.apiVersion,
  token: env.token,
  useCdn: false,
})

const filename = basename(filePath)
const bytes = statSync(filePath).size
console.log(`Uploading ${filename} (${(bytes / 1024 / 1024).toFixed(1)} MB) to ${env.projectId}/${env.dataset}...`)

const asset = await client.assets.upload('file', createReadStream(filePath), {filename})

console.log('\nDone. Asset URL:\n')
console.log(asset.url)
console.log(`\nAsset _id: ${asset._id}`)
