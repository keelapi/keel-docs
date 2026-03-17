import Image from 'next/image'
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

function ProviderCell({ provider, emphasize = false }: { provider: string; emphasize?: boolean }) {
  return (
    <span className="x:inline-flex x:items-center x:gap-3">
      {PROVIDER_LOGOS[provider] ? (
        <Image
          src={PROVIDER_LOGOS[provider]}
          alt=""
          aria-hidden="true"
          width={18}
          height={18}
          className="x:size-[18px] x:object-contain"
          unoptimized
        />
      ) : null}
      <span
        className={[
          'x:text-sm x:text-slate-900 x:dark:text-slate-50',
          emphasize ? 'x:font-semibold' : 'x:font-medium'
        ].join(' ')}
      >
        {getProviderLabel(provider)}
      </span>
    </span>
  )
}

function SupportIcon({ supported }: { supported: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={[
        'x:flex x:size-5 x:items-center x:justify-center x:rounded-full x:border',
        supported
          ? 'x:border-emerald-200 x:bg-emerald-50 x:text-emerald-600 x:dark:border-emerald-900/80 x:dark:bg-emerald-950/60 x:dark:text-emerald-300'
          : 'x:border-slate-200 x:bg-slate-100 x:text-slate-500 x:dark:border-slate-700 x:dark:bg-slate-900 x:dark:text-slate-400'
      ].join(' ')}
    >
      <span className="x:text-[0.75rem] x:font-semibold">{supportSymbol(supported)}</span>
    </span>
  )
}

function SupportBadge({
  label,
  supported
}: {
  label: string
  supported: boolean
}) {
  return (
    <span
      className="x:inline-flex x:items-center x:gap-2 x:rounded-full x:border x:border-slate-200 x:bg-slate-50 x:px-3 x:py-1.5 x:text-sm x:text-slate-700 x:dark:border-slate-800 x:dark:bg-slate-900/70 x:dark:text-slate-200"
      aria-label={`${label}: ${supported ? 'supported' : 'not supported'}`}
    >
      <SupportIcon supported={supported} />
      <span className="x:font-medium">{label}</span>
    </span>
  )
}

function OperationPill({ operation, tone = 'supported' }: { operation: string; tone?: 'supported' | 'unsupported' }) {
  return (
    <code
      className={[
        'x:inline-flex x:items-center x:rounded-full x:border x:px-2.5 x:py-1 x:text-[0.76rem] x:font-medium',
        tone === 'supported'
          ? 'x:border-slate-200 x:bg-white x:text-slate-700 x:dark:border-slate-700 x:dark:bg-slate-950 x:dark:text-slate-200'
          : 'x:border-amber-200 x:bg-amber-50 x:text-amber-800 x:dark:border-amber-900/80 x:dark:bg-amber-950/50 x:dark:text-amber-300'
      ].join(' ')}
    >
      {operation}
    </code>
  )
}

function CapabilitySummary({
  executionsSupported,
  proxySupported,
  streamingSupported,
  supportedOperations,
  unsupportedOperations
}: {
  executionsSupported: boolean
  proxySupported: boolean
  streamingSupported: boolean
  supportedOperations: string[]
  unsupportedOperations: string[]
}) {
  return (
    <div className="x:space-y-3">
      <div className="x:flex x:flex-wrap x:gap-2.5">
        <SupportBadge label="Proxy" supported={proxySupported} />
        <SupportBadge label="Executions" supported={executionsSupported} />
        <SupportBadge label="Streaming" supported={streamingSupported} />
      </div>
      <div className="x:space-y-2">
        {supportedOperations.length > 0 ? (
          <div className="x:flex x:flex-wrap x:items-start x:gap-2">
            <span className="x:min-w-20 x:pt-1 x:text-[0.72rem] x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
              Operations
            </span>
            <div className="x:flex x:flex-wrap x:gap-1.5">
              {supportedOperations.map(operation => (
                <OperationPill key={operation} operation={operation} />
              ))}
            </div>
          </div>
        ) : null}
        {unsupportedOperations.length > 0 ? (
          <div className="x:flex x:flex-wrap x:items-start x:gap-2">
            <span className="x:min-w-20 x:pt-1 x:text-[0.72rem] x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
              Limited
            </span>
            <div className="x:flex x:flex-wrap x:gap-1.5">
              {unsupportedOperations.map(operation => (
                <OperationPill key={operation} operation={operation} tone="unsupported" />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
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

  return (
    <div className="x:mt-6 x:overflow-x-auto x:rounded-2xl x:border x:border-slate-200 x:bg-white/80 x:shadow-sm x:shadow-slate-900/5 x:dark:border-slate-800 x:dark:bg-slate-950/40">
      <table className="x:min-w-[920px] x:w-full x:border-collapse x:text-sm">
        <colgroup>
          <col className="x:w-[18%]" />
          <col className="x:w-[42%]" />
          <col className="x:w-[40%]" />
        </colgroup>
        <caption className="x:sr-only">
          Provider support reference generated from the backend artifact.
        </caption>
        <thead className="x:bg-slate-50/85 x:dark:bg-slate-900/80">
          <tr className="x:border-b x:border-slate-200 x:text-left x:dark:border-slate-800">
            <th className="x:px-5 x:py-3 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
              Provider
            </th>
            <th className="x:px-5 x:py-3 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
              Capability Summary
            </th>
            <th className="x:px-5 x:py-3 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {artifact.providers.map(provider => (
            <tr
              key={provider.provider}
              className="x:border-b x:border-slate-200 x:align-top x:last:border-b-0 x:dark:border-slate-800"
            >
              <th scope="row" className="x:px-5 x:py-5 x:font-normal">
                <ProviderCell provider={provider.provider} emphasize />
              </th>
              <td className="x:px-5 x:py-5">
                <CapabilitySummary
                  executionsSupported={provider.executionsSupported}
                  proxySupported={provider.proxySupported}
                  streamingSupported={provider.streamingSupported}
                  supportedOperations={provider.supportedOperations}
                  unsupportedOperations={provider.unsupportedOperations}
                />
              </td>
              <td className="x:px-5 x:py-5 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                {provider.notes ? (
                  <p className="x:m-0">{provider.notes}</p>
                ) : (
                  <p className="x:m-0 x:text-slate-400 x:dark:text-slate-500">
                    No additional provider-specific notes.
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
