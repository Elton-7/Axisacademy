// Pulls the embedded bitmap out of the logo PDF and writes it as a PNG.
const fs = require('fs')
const zlib = require('zlib')

const SRC = 'C:/Users/Elton/Documents/Axis_Learning_Logo.pdf'
const buf = fs.readFileSync(SRC)
const latin = buf.toString('latin1')

// Object 3 holds the image; take the bytes between `stream` and `endstream`.
const start = latin.indexOf('3 0 obj')
const sTag = latin.indexOf('stream', start)
const dataStart = latin[sTag + 6] === '\r' ? sTag + 8 : sTag + 7
const dataEnd = latin.indexOf('endstream', dataStart)
let payload = buf.subarray(dataStart, dataEnd)

/** ASCII85, as PDF writes it: whitespace ignored, `z` is four zero bytes, `~>` ends it. */
function ascii85Decode(input) {
  const out = []
  let tuple = 0
  let count = 0
  for (let i = 0; i < input.length; i++) {
    const c = input[i]
    if (c === 0x7e) break // ~>
    if (c <= 0x20 || c === 0x0a || c === 0x0d) continue
    if (c === 0x7a && count === 0) { out.push(0, 0, 0, 0); continue }
    tuple = tuple * 85 + (c - 33)
    if (++count === 5) {
      out.push((tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255)
      tuple = 0; count = 0
    }
  }
  if (count > 0) {
    for (let i = count; i < 5; i++) tuple = tuple * 85 + 84
    const bytes = [(tuple >>> 24) & 255, (tuple >>> 16) & 255, (tuple >>> 8) & 255, tuple & 255]
    out.push(...bytes.slice(0, count - 1))
  }
  return Buffer.from(out)
}

const rgb = zlib.inflateSync(ascii85Decode(payload))
const W = 1536, H = 1024
console.log('decoded bytes:', rgb.length, 'expected:', W * H * 3)

// --- minimal PNG writer -----------------------------------------------------
const crcTable = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()
const crc32 = (b) => {
  let c = -1
  for (let i = 0; i < b.length; i++) c = crcTable[(c ^ b[i]) & 255] ^ (c >>> 8)
  return (c ^ -1) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length)
  const td = Buffer.concat([Buffer.from(type, 'latin1'), data])
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td))
  return Buffer.concat([len, td, crc])
}

/** channels: 3 = RGB (colour type 2), 4 = RGBA (colour type 6). */
function writePng(path, pixels, w, h, channels) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8; ihdr[9] = channels === 4 ? 6 : 2
  const raw = Buffer.alloc(h * (1 + w * channels))
  for (let y = 0; y < h; y++) {
    raw[y * (1 + w * channels)] = 0 // no per-row filter
    pixels.copy(raw, y * (1 + w * channels) + 1, y * w * channels, (y + 1) * w * channels)
  }
  fs.writeFileSync(path, Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]))
  console.log('wrote', path, (fs.statSync(path).size / 1024).toFixed(0) + 'KB')
}

writePng('logo-raw.png', rgb, W, H, 3)
module.exports = { writePng, rgb, W, H }
