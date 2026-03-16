import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import themeConfig from '../../theme.config'

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
            <span className="x:flex x:items-center x:gap-3">
              <span className="x:inline-flex x:h-8 x:w-8 x:items-center x:justify-center x:rounded-md x:border x:border-slate-300 x:bg-white x:text-sm x:font-semibold x:text-slate-900 x:shadow-sm x:dark:border-slate-700 x:dark:bg-slate-950 x:dark:text-slate-100">
                K
              </span>
              <span className="x:flex x:flex-col">
                <span className="x:text-sm x:font-semibold x:text-slate-950 x:dark:text-slate-50">
                  Keel Docs
                </span>
                <span className="x:text-xs x:text-slate-500 x:dark:text-slate-400">
                  Governed AI infrastructure
                </span>
              </span>
            </span>
          }
        />
      }
      footer={
        <Footer>
          <span className="x:text-sm x:text-slate-600 x:dark:text-slate-400">
            Keel Docs
          </span>
        </Footer>
      }
      docsRepositoryBase={themeConfig.docsRepositoryBase}
      sidebar={themeConfig.sidebar}
      toc={themeConfig.toc}
      feedback={themeConfig.feedback}
      editLink={themeConfig.editLink}
    >
      {children}
    </Layout>
  )
}
