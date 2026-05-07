/**
 * Generate taluka coords file for known Devanagari talukas in Sangli district.
 *
 * Usage:
 *   node scripts/generate-taluka-coords.js
 *
 * It reads process.env.GOOGLE_MAPS_API_KEY and writes to public/data/taluka-coords.json
 * Do NOT commit your API key. This script will run locally and use the key from your .env.local when executed.
 */

const fs = require('fs')
const path = require('path')

// List of talukas in Sangli district (Devanagari). Update if the form changes.
const talukas = [
  'मिरज',
  'तासगाव',
  'जत',
  'कवठेमहांकाळ',
  'खानापूर',
  'आटपाडी',
  'पलूस',
  'शिराळा',
  'वाळवा',
  'कडेगाव'
]

// Manual Devanagari -> Latin candidate map to improve hit-rate when transliteration is imperfect
const candidates = {
  'मिरज': ['Miraj'],
  'तासगाव': ['Tasgaon', 'Tasgao'],
  'जत': ['Jat'],
  'कवठेमहांकाळ': ['Kavathemahankal', 'Kavatemahankal', 'Kavthe Mahankal'],
  'खानापूर': ['Khanapur'],
  'आटपाडी': ['Atpadi'],
  'पलूस': ['Palus'],
  'शिराळा': ['Shirala'],
  'वाळवा': ['Walwa', 'Valva'],
  'कडेगाव': ['Kadegaon', 'Kadegav']
}

async function geocodeWithGoogle(address, key) {
  const q = encodeURIComponent(address)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${q}&key=${key}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const body = await res.json()
  if (body.status === 'OK' && body.results && body.results.length > 0) {
    const loc = body.results[0].geometry.location
    return { lat: loc.lat, lon: loc.lng }
  }
  return null
}

async function geocodeWithNominatim(address) {
  const q = encodeURIComponent(address)
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`
  const res = await fetch(url, { headers: { 'User-Agent': 'Wildlife-Call-Management-Script/1.0' } })
  if (!res.ok) return null
  const arr = await res.json()
  if (Array.isArray(arr) && arr.length > 0) {
    return { lat: Number(arr[0].lat), lon: Number(arr[0].lon) }
  }
  return null
}

// Very small Devanagari -> Latin transliteration used as a fallback when direct queries fail
function transliterateDevanagariToLatin(s) {
  if (!s) return ''
  const map = {
    'अ': 'a','आ':'aa','इ':'i','ई':'ii','उ':'u','ऊ':'uu','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au',
    'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'ng',
    'च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'ny',
    'ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n',
    'त':'t','थ':'th','द':'d','ध':'dh','न':'n',
    'प':'p','फ':'ph','ब':'b','भ':'bh','म':'m',
    'य':'y','र':'r','ल':'l','व':'v','ळ':'l',
    'श':'sh','ष':'sh','स':'s','ह':'h',
    'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','े':'e','ै':'ai','ो':'o','ौ':'au','्':'',
    'ँ':'n','ं':'n','ः':'h'
  }
  let out = ''
  for (let i = 0; i < s.length; i++) {
    const ch = s[i]
    out += (map[ch] !== undefined) ? map[ch] : ch
  }
  out = out.replace(/\s+/g, ' ').trim()
  if (out.length > 1) out = out[0].toUpperCase() + out.slice(1)
  return out
}

async function main() {
  const key = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY
  if (!key) {
    console.error('ERROR: GOOGLE_MAPS_API_KEY or NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY must be set in environment')
    process.exit(1)
  }

  const out = {}

  for (const t of talukas) {
    const address = `${t}, Sangli, Maharashtra, India`
    try {
      console.log('Geocoding', address)
      let coords = await geocodeWithGoogle(address, key)
      if (!coords) {
        // Try transliterated form (Devanagari -> Latin) and query again
        const translit = transliterateDevanagariToLatin(t)
        if (translit && translit !== t) {
          const tAddr = `${translit}, Sangli, Maharashtra, India`
          console.log('  trying transliteration:', tAddr)
          coords = await geocodeWithGoogle(tAddr, key)
        }
      }

      // If still not found, try manual candidate list (common Latin spellings)
      if (!coords && candidates[t]) {
        for (const cand of candidates[t]) {
          try {
            const candAddr = `${cand}, Sangli, Maharashtra, India`
            console.log('  trying candidate:', candAddr)
            coords = await geocodeWithGoogle(candAddr, key)
            if (coords) break
            // polite pause
            await new Promise(r => setTimeout(r, 120))
          } catch (err) {
            console.warn('  candidate failed', cand, err.message || err)
          }
        }
      }

      // If still not found, try Nominatim (OpenStreetMap) with the same sequence
      if (!coords) {
        try {
          console.log('  trying Nominatim for original')
          coords = await geocodeWithNominatim(address)
        } catch (err) {
          // ignore
        }
      }

      if (!coords) {
        const translit = transliterateDevanagariToLatin(t)
        if (translit && translit !== t) {
          try {
            const tAddr = `${translit}, Sangli, Maharashtra, India`
            console.log('  trying Nominatim transliteration:', tAddr)
            coords = await geocodeWithNominatim(tAddr)
          } catch (err) {}
        }
      }

      if (!coords && candidates[t]) {
        for (const cand of candidates[t]) {
          try {
            const candAddr = `${cand}, Sangli, Maharashtra, India`
            console.log('  trying Nominatim candidate:', candAddr)
            coords = await geocodeWithNominatim(candAddr)
            if (coords) break
            await new Promise(r => setTimeout(r, 120))
          } catch (err) {
            // ignore
          }
        }
      }

      if (coords) {
        out[t] = coords
        console.log(' →', coords)
      } else {
        console.warn('No result for', address)
      }
      // be polite
      await new Promise(r => setTimeout(r, 150))
    } catch (err) {
      console.warn('Error geocoding', address, err.message || err)
    }
  }

  const outPath = path.join(__dirname, '..', 'public', 'data', 'taluka-coords.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8')
  console.log('Wrote', outPath)
}

// Node 18+ has global fetch; polyfill if not present
if (typeof fetch === 'undefined') {
  global.fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args))
}

main().catch(err => {
  console.error('Fatal error', err)
  process.exit(1)
})
