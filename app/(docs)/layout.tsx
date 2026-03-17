import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import { DocsPageMeta } from '../../components/docs-page-meta'
import { ThemeToggle } from '../../components/theme-toggle'
import themeConfig, { docsPageMetaEditLinkText } from '../../theme.config'

export default async function DocsLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const pageMap = await getPageMap()

  return (
    <Layout
      pageMap={pageMap}
      navbar={
        <Navbar
          logo={
            <span className="keel-docs-brand">
              <span className="keel-docs-brand__badge">
                Keel
              </span>
              <span className="keel-docs-brand__copy">
                <span className="keel-docs-brand__title">
                  Docs
                </span>
                <span className="keel-docs-brand__subtitle">
                  Governed AI infrastructure
                </span>
              </span>
            </span>
          }
        >
          <ThemeToggle />
        </Navbar>
      }
      footer={
        <Footer>
          <span className="x:text-sm x:text-gray-600 x:dark:text-gray-400">
            Keel Docs
          </span>
        </Footer>
      }
      darkMode={false}
      docsRepositoryBase={themeConfig.docsRepositoryBase}
      editLink={themeConfig.editLink}
      sidebar={themeConfig.sidebar}
      toc={themeConfig.toc}
      feedback={themeConfig.feedback}
      nextThemes={{
        attribute: 'class',
        defaultTheme: 'system',
        disableTransitionOnChange: true,
        storageKey: 'keel-theme'
      }}
      lastUpdated={
        themeConfig.gitTimestamp ? (
          <DocsPageMeta
            docsRepositoryBase={themeConfig.docsRepositoryBase}
            editLinkText={docsPageMetaEditLinkText}
          />
        ) : undefined
      }
    >
      {children}
    </Layout>
  )
}
