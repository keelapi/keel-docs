import { getProviderSupportArtifact } from '@/lib/public-artifacts'

const PROVIDER_LOGOS: Record<string, string> = {
  anthropic: '/provider-logos/anthropic.svg',
  google: '/provider-logos/google.svg',
  meta: '/provider-logos/meta.svg',
  openai: '/provider-logos/openai.svg',
  xai: '/provider-logos/xai.svg'
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  google: 'Google',
  meta: 'Meta',
  openai: 'OpenAI',
  xai: 'xAI'
}

function supportSymbol(value: boolean): string {
  return value ? 'Yes' : 'No'
}

function getProviderLabel(provider: string): string {
  return PROVIDER_LABELS[provider] ?? provider
}

export async function ProviderSupportTable() {
  const artifact = await getProviderSupportArtifact()

  if (artifact.error) {
    return (
      <>
        <p>
          Keel could not read <code>{artifact.fileName}</code>.
        </p>
        <pre>{artifact.error}</pre>
      </>
    )
  }

  if (!artifact.exists) {
    return (
      <p>
        <code>{artifact.fileName}</code> is not present in this docs repo yet. This page
        will render provider support details automatically when the artifact is added
        under <code>data/</code>.
      </p>
    )
  }

  if (artifact.providers.length === 0) {
    return (
      <p>
        <code>{artifact.fileName}</code> was found, but this page could not render any
        provider rows from it.
      </p>
    )
  }

  const notedProviders = artifact.providers.filter(
    provider =>
      provider.notes ||
      provider.supportedOperations.length > 0 ||
      provider.unsupportedOperations.length > 0
  )

  return (
    <>
      <p className="x:text-sm x:text-slate-600 x:dark:text-slate-300">
        Generated from <code>{artifact.fileName}</code>
        {artifact.generatedAt ? (
          <>
            {' '}
            at <time dateTime={artifact.generatedAt}>{artifact.generatedAt}</time>
          </>
        ) : null}
        .
      </p>
      <div className="x:overflow-x-auto x:rounded-2xl x:border x:border-slate-200 x:bg-white/80 x:shadow-sm x:shadow-slate-950/5 x:backdrop-blur x:dark:border-slate-800 x:dark:bg-slate-950/60">
        <table className="x:min-w-full x:border-separate x:border-spacing-0">
          <caption className="x:sr-only">
            Provider support matrix generated from the backend artifact.
          </caption>
          <thead>
            <tr className="x:bg-slate-900/[0.03] x:text-left x:dark:bg-slate-100/[0.04]">
              <th className="x:px-5 x:py-3.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Provider
              </th>
              <th className="x:px-5 x:py-3.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Proxy
              </th>
              <th className="x:px-5 x:py-3.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Executions
              </th>
              <th className="x:px-5 x:py-3.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Streaming
              </th>
            </tr>
          </thead>
          <tbody>
            {artifact.providers.map(provider => (
              <tr
                key={provider.provider}
                className="x:align-middle x:[&:not(:last-child)>*]:border-b x:[&:not(:last-child)>*]:border-slate-200 x:[&:not(:last-child)>*]:dark:border-slate-800"
              >
                <th scope="row" className="x:px-5 x:py-4 x:font-normal">
                  <span className="x:inline-flex x:items-center x:gap-3">
                    {PROVIDER_LOGOS[provider.provider] ? (
                      <img
                        src={PROVIDER_LOGOS[provider.provider]}
                        alt=""
                        aria-hidden="true"
                        width={18}
                        height={18}
                        style={{
                          display: 'block',
                          flexShrink: 0
                        }}
                      />
                    ) : null}
                    <span className="x:text-sm x:font-semibold x:text-slate-900 x:dark:text-slate-50">
                      {getProviderLabel(provider.provider)}
                    </span>
                  </span>
                </th>
                {[provider.proxySupported, provider.executionsSupported, provider.streamingSupported].map(
                  (value, index) => (
                    <td key={`${provider.provider}-${index}`} className="x:px-5 x:py-4 x:text-center">
                      <span
                        className={[
                          'x:inline-flex x:min-w-14 x:justify-center x:rounded-full x:border x:px-3 x:py-1.5 x:text-xs x:font-semibold',
                          value
                            ? 'x:border-emerald-200 x:bg-emerald-500/10 x:text-emerald-700 x:dark:border-emerald-500/30 x:dark:bg-emerald-500/15 x:dark:text-emerald-300'
                            : 'x:border-slate-200 x:bg-slate-900/[0.03] x:text-slate-500 x:dark:border-slate-700 x:dark:bg-slate-100/[0.04] x:dark:text-slate-300'
                        ].join(' ')}
                      >
                        {supportSymbol(value)}
                      </span>
                    </td>
                  )
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {notedProviders.length > 0 ? (
        <section className="x:mt-8 x:space-y-4">
          <h2>Provider Notes</h2>
          <div className="x:grid x:gap-4">
            {notedProviders.map(provider => (
              <article
                key={`${provider.provider}-notes`}
                className="x:rounded-2xl x:border x:border-slate-200 x:bg-slate-50/75 x:p-5 x:shadow-sm x:shadow-slate-950/5 x:dark:border-slate-800 x:dark:bg-slate-900/50"
              >
                <div className="x:flex x:flex-col x:gap-3">
                  <h3 className="x:m-0 x:text-base x:font-semibold x:text-slate-900 x:dark:text-slate-50">
                    {getProviderLabel(provider.provider)}
                  </h3>
                  {provider.notes ? (
                    <p className="x:m-0 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                      {provider.notes}
                    </p>
                  ) : null}
                  {provider.supportedOperations.length > 0 ? (
                    <div className="x:flex x:flex-wrap x:gap-2">
                      {provider.supportedOperations.map(operation => (
                        <code
                          key={`${provider.provider}-${operation}`}
                          className="x:rounded-full x:border x:border-slate-200 x:bg-white x:px-2.5 x:py-1 x:text-xs x:text-slate-700 x:dark:border-slate-700 x:dark:bg-slate-950 x:dark:text-slate-200"
                        >
                          {operation}
                        </code>
                      ))}
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </>
  )
}
