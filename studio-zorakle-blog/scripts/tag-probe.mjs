import {createClient} from '@sanity/client'
function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
}
function getTerms(post, taxonomy) {
  const termGroups = post?._embedded?.['wp:term'] || []
  const names = []
  for (const group of termGroups) {
    for (const term of group) {
      if (term?.taxonomy !== taxonomy) continue
      if (typeof term?.name !== 'string' || !term.name.trim()) continue
      names.push(decodeHtmlEntities(term.name.trim()))
    }
  }
  return [...new Set(names)]
}
const res = await fetch('https://www.zorakleprofiles.com/wp-json/wp/v2/posts?per_page=10&_embed=1&status=publish')
const posts = await res.json()
for (const post of posts) {
  const categories = getTerms(post, 'category')
  const wpTags = getTerms(post, 'post_tag')
  const tags = [...new Set([...categories, ...wpTags])]
  console.log(`[${post.id}] cats=${JSON.stringify(categories)} | merged tags=${JSON.stringify(tags.slice(0,5))}...`)
}
