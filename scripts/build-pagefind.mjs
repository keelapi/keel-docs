import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'

const siteDir = resolve(process.env.PAGEFIND_SITE ?? '.next/server/app')
const outputDir = resolve(process.env.PAGEFIND_OUTPUT ?? 'public/_pagefind')
const pagefindEntry = resolve(outputDir, 'pagefind.js')
const pagefindBin = resolve(
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'pagefind.cmd' : 'pagefind'
)

if (!existsSync(siteDir)) {
  throw new Error(`[pagefind] Build output not found: ${siteDir}`)
}

rmSync(outputDir, { force: true, recursive: true })
mkdirSync(outputDir, { recursive: true })

console.log(`[pagefind] Indexing ${siteDir}`)

const result = spawnSync(pagefindBin, ['--site', siteDir, '--output-path', outputDir], {
  stdio: 'inherit'
})

if (result.status !== 0) {
  throw new Error(`[pagefind] Indexing failed with exit code ${result.status ?? 'unknown'}`)
}

if (!existsSync(pagefindEntry)) {
  throw new Error(`[pagefind] Missing expected bundle: ${pagefindEntry}`)
}

console.log(`[pagefind] Verified ${pagefindEntry}`)
