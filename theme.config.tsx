export const docsPageMetaEditLinkText = 'Edit this page on GitHub'

const themeConfig = {
  docsRepositoryBase: 'https://github.com/keelapi/keel-docs/tree/main',
  gitTimestamp: true,
  head: (
    <>
      <meta name="theme-color" media="(prefers-color-scheme: light)" content="#f8fafc" />
      <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#121826" />
      <meta
        name="description"
        content="Keel documentation — policy enforcement and execution governance for AI systems."
      />
    </>
  ),
  sidebar: {
    defaultMenuCollapseLevel: 1
  },
  toc: {
    backToTop: 'Back to top',
    title: 'On this page'
  },
  feedback: {
    content: null
  },
  editLink: null
}

export default themeConfig
