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
  return value ? '✓' : '✗'
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
      <div className="x:overflow-x-auto">
        <table className="x:min-w-full x:border-collapse x:text-sm">
          <caption className="x:sr-only">
            Provider support matrix generated from the backend artifact.
          </caption>
          <thead>
            <tr className="x:border-b x:border-slate-200 x:text-left x:dark:border-slate-800">
              <th className="x:px-3 x:py-2.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Provider
              </th>
              <th className="x:px-3 x:py-2.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Proxy
              </th>
              <th className="x:px-3 x:py-2.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Executions
              </th>
              <th className="x:px-3 x:py-2.5 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Streaming
              </th>
            </tr>
          </thead>
          <tbody>
            {artifact.providers.map(provider => (
              <tr
                key={provider.provider}
                className="x:border-b x:border-slate-200 x:last:border-b-0 x:dark:border-slate-800"
              >
                <th scope="row" className="x:px-3 x:py-3 x:font-normal">
                  <span className="x:inline-flex x:items-center x:gap-2.5">
                    {PROVIDER_LOGOS[provider.provider] ? (
                      <img
                        src={PROVIDER_LOGOS[provider.provider]}
                        alt=""
                        aria-hidden="true"
                        width={16}
                        height={16}
                        style={{
                          display: 'block',
                          flexShrink: 0
                        }}
                      />
                    ) : null}
                    <span className="x:text-sm x:font-medium x:text-slate-900 x:dark:text-slate-50">
                      {getProviderLabel(provider.provider)}
                    </span>
                  </span>
                </th>
                {[provider.proxySupported, provider.executionsSupported, provider.streamingSupported].map(
                  (value, index) => (
                    <td
                      key={`${provider.provider}-${index}`}
                      className="x:px-3 x:py-3 x:text-center x:text-base x:text-slate-700 x:dark:text-slate-200"
                    >
                      <span aria-label={value ? 'supported' : 'not supported'}>
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
        <section className="x:mt-6 x:space-y-4">
          <h2>Notes</h2>
          <dl className="x:space-y-4">
            {notedProviders.map(provider => (
              <div
                key={`${provider.provider}-notes`}
                className="x:grid x:gap-1 sm:x:grid-cols-[12rem_minmax(0,1fr)] sm:x:gap-4"
              >
                <dt className="x:text-sm x:font-semibold x:text-slate-900 x:dark:text-slate-50">
                  {getProviderLabel(provider.provider)}
                </dt>
                <dd className="x:m-0 x:space-y-1.5 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                  {provider.notes ? <p className="x:m-0">{provider.notes}</p> : null}
                  {provider.supportedOperations.length > 0 ? (
                    <p className="x:m-0">
                      <span className="x:font-medium x:text-slate-900 x:dark:text-slate-100">
                        Supported operations:
                      </span>{' '}
                      <code>{provider.supportedOperations.join(', ')}</code>
                    </p>
                  ) : null}
                  {provider.unsupportedOperations.length > 0 ? (
                    <p className="x:m-0">
                      <span className="x:font-medium x:text-slate-900 x:dark:text-slate-100">
                        Unsupported operations:
                      </span>{' '}
                      <code>{provider.unsupportedOperations.join(', ')}</code>
                    </p>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </>
  )
}
