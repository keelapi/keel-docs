import type { Metadata } from 'next'
import { generateStaticParamsFor, importPage } from 'nextra/pages'
import { getMDXComponents } from '../../../mdx-components'

const DOCS_TITLE = 'Keel Docs'
const DOCS_TITLE_PREFIX = `${DOCS_TITLE} | `

type PageProps = {
  params: Promise<{
    mdxPath?: string[]
  }>
}

export const generateStaticParams = generateStaticParamsFor('mdxPath')

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params
  const { metadata } = await importPage(params.mdxPath)
  const normalizedTitle = metadata.title?.toString().trim()

  if (!params.mdxPath?.length) {
    return {
      ...metadata,
      title: {
        absolute: DOCS_TITLE
      }
    }
  }

  if (!normalizedTitle) {
    return metadata
  }

  const cleanTitle = normalizedTitle.startsWith(DOCS_TITLE_PREFIX)
    ? normalizedTitle.slice(DOCS_TITLE_PREFIX.length).trim()
    : normalizedTitle

  return {
    ...metadata,
    title: cleanTitle === DOCS_TITLE ? { absolute: DOCS_TITLE } : cleanTitle
  }
}

export default async function DocsPage(props: PageProps) {
  const params = await props.params
  const result = await importPage(params.mdxPath)
  const { default: MDXContent, metadata, sourceCode, toc } = result
  const Wrapper = getMDXComponents().wrapper

  return (
    <Wrapper toc={toc} metadata={metadata} sourceCode={sourceCode}>
      <MDXContent {...props} params={params} />
    </Wrapper>
  )
}
