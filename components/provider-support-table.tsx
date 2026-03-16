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

  const notedProviders = artifact.providers.filter(provider => provider.notes)

  return (
    <>
      <p>
        Generated from <code>{artifact.fileName}</code>
        {artifact.generatedAt ? ` at ${artifact.generatedAt}` : ''}.
      </p>
      <table>
        <thead>
          <tr>
            <th>Provider</th>
            <th>Proxy</th>
            <th>Executions</th>
            <th>Streaming</th>
          </tr>
        </thead>
        <tbody>
          {artifact.providers.map(provider => (
            <tr key={provider.provider}>
              <td>
                <span
                  style={{
                    alignItems: 'center',
                    display: 'inline-flex',
                    gap: '0.5rem'
                  }}
                >
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
                  <span>{getProviderLabel(provider.provider)}</span>
                </span>
              </td>
              <td>{supportSymbol(provider.proxySupported)}</td>
              <td>{supportSymbol(provider.executionsSupported)}</td>
              <td>{supportSymbol(provider.streamingSupported)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {notedProviders.length > 0 ? (
        <>
          <h2>Notes</h2>
          {notedProviders.map(provider => (
            <div key={`${provider.provider}-notes`}>
              <h3>
                <code>{getProviderLabel(provider.provider)}</code>
              </h3>
              <p>{provider.notes}</p>
            </div>
          ))}
        </>
      ) : null}
    </>
  )
}
