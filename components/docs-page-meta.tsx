'use client'

import { Anchor } from 'nextra/components'
import { LastUpdated, useConfig } from 'nextra-theme-docs'

type DocsPageMetaProps = {
  date?: Date
  docsRepositoryBase: string
  editLinkText: string
}

export function DocsPageMeta({
  date,
  docsRepositoryBase,
  editLinkText
}: DocsPageMetaProps) {
  const { normalizePagesResult } = useConfig()
  const filePath = normalizePagesResult.activeMetadata?.filePath
  const editHref = filePath
    ? filePath.startsWith('http')
      ? filePath
      : `${docsRepositoryBase.replace(/\/$/, '')}/${filePath}`
    : null

  return (
    <div className="x:flex x:flex-col x:items-end x:gap-2">
      <LastUpdated date={date}>Last updated on</LastUpdated>
      {editHref ? (
        <Anchor
          className="x:text-xs x:font-medium x:text-gray-600 x:transition x:hover:text-gray-800 x:dark:text-gray-400 x:dark:hover:text-gray-200"
          href={editHref}
        >
          {editLinkText}
        </Anchor>
      ) : null}
    </div>
  )
}
