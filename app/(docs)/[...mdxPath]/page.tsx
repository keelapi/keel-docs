
import { readdir } from 'node:fs/promises'
import path from 'node:path'
import type { Metadata } from 'next'
import { importPage } from 'nextra/pages'
import { getMDXComponents } from '../../../mdx-components'

type PageProps = {
  params: Promise<{
    mdxPath?: string[]
  }>
}

const CONTENT_DIR = path.join(process.cwd(), 'content')

async function collectRoutes(dir: string, prefix: string[] = []): Promise<string[][]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const routes: string[][] = []

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) {
      continue
    }

    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      routes.push(...(await collectRoutes(entryPath, [...prefix, entry.name])))
      continue
    }

    const match = entry.name.match(/^(.*)\.(md|mdx)$/)

    if (!match) {
      continue
    }

    const name = match[1]
    routes.push(name === 'index' ? prefix : [...prefix, name])
  }

  return routes
}

export async function generateStaticParams() {
  const routes = await collectRoutes(CONTENT_DIR)
  return routes.map((mdxPath) => ({ mdxPath }))
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)

  return metadata
}

export default async function DocsPage(props: PageProps) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, metadata, sourceCode, toc } = result
  const Wrapper = getMDXComponents().wrapper

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent params={params} />
    </Wrapper>
  )
}