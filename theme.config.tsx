const themeConfig = {
  docsRepositoryBase: 'https://github.com/keelapi/keel-docs/tree/main',
  gitTimestamp: true,
  head: (
    <>
      <meta name="theme-color" content="#000000" />
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
  editLink: 'Edit this page on GitHub'
}

export default themeConfig
