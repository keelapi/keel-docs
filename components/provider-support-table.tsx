import { getProviderSupportArtifact } from '@/lib/public-artifacts'

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic',
  google: 'Google',
  meta: 'Meta',
  openai: 'OpenAI',
  xai: 'xAI'
}

function supportSymbol(value: boolean): string {
  return value ? '✓' : '✕'
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

  const providersWithOperations = artifact.providers.filter(
    provider =>
      provider.supportedOperations.length > 0 || provider.unsupportedOperations.length > 0
  )

  return (
    <div className="x:mt-6 x:space-y-6">
      <div className="x:overflow-x-auto">
        <table className="x:min-w-[720px] x:w-full x:border-collapse x:text-sm">
          <caption className="x:sr-only">Provider support reference.</caption>
          <thead>
            <tr className="x:border-y x:border-slate-200 x:dark:border-slate-800">
              <th className="x:px-4 x:py-3 x:text-left x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Provider
              </th>
              <th className="x:px-4 x:py-3 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Proxy
              </th>
              <th className="x:px-4 x:py-3 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Executions
              </th>
              <th className="x:px-4 x:py-3 x:text-center x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Streaming
              </th>
              <th className="x:px-4 x:py-3 x:text-left x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Notes
              </th>
            </tr>
          </thead>
          <tbody>
            {artifact.providers.map(provider => (
              <tr
                key={provider.provider}
                className="x:border-b x:border-slate-200 x:dark:border-slate-800"
              >
                <th
                  scope="row"
                  className="x:px-4 x:py-3.5 x:text-left x:text-sm x:font-medium x:text-slate-900 x:dark:text-slate-50"
                >
                  {getProviderLabel(provider.provider)}
                </th>
                <td
                  className="x:px-4 x:py-3.5 x:text-center x:text-base x:text-slate-900 x:dark:text-slate-50"
                  aria-label={`Proxy: ${provider.proxySupported ? 'supported' : 'not supported'}`}
                >
                  {supportSymbol(provider.proxySupported)}
                </td>
                <td
                  className="x:px-4 x:py-3.5 x:text-center x:text-base x:text-slate-900 x:dark:text-slate-50"
                  aria-label={`Executions: ${
                    provider.executionsSupported ? 'supported' : 'not supported'
                  }`}
                >
                  {supportSymbol(provider.executionsSupported)}
                </td>
                <td
                  className="x:px-4 x:py-3.5 x:text-center x:text-base x:text-slate-900 x:dark:text-slate-50"
                  aria-label={`Streaming: ${
                    provider.streamingSupported ? 'supported' : 'not supported'
                  }`}
                >
                  {supportSymbol(provider.streamingSupported)}
                </td>
                <td className="x:px-4 x:py-3.5 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                  {provider.notes ? provider.notes : 'No additional notes.'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {providersWithOperations.length > 0 ? (
        <section aria-labelledby="provider-support-operations">
          <h2
            id="provider-support-operations"
            className="x:text-base x:font-semibold x:text-slate-900 x:dark:text-slate-50"
          >
            Execution operations
          </h2>
          <dl className="x:mt-3 x:divide-y x:divide-slate-200 x:border-y x:border-slate-200 x:dark:divide-slate-800 x:dark:border-slate-800">
            {providersWithOperations.map(provider => (
              <div
                key={provider.provider}
                className="x:grid x:gap-2 x:px-4 x:py-3.5 md:x:grid-cols-[160px_minmax(0,1fr)]"
              >
                <dt className="x:text-sm x:font-medium x:text-slate-900 x:dark:text-slate-50">
                  {getProviderLabel(provider.provider)}
                </dt>
                <dd className="x:m-0 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                  {provider.supportedOperations.length > 0 ? (
                    <span>{provider.supportedOperations.join(', ')}</span>
                  ) : (
                    <span>No documented execution operations.</span>
                  )}
                  {provider.unsupportedOperations.length > 0 ? (
                    <span className="x:block">
                      Limited: {provider.unsupportedOperations.join(', ')}
                    </span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
    </div>
  )
}
