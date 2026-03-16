import { getPublicRoutesArtifact } from '@/lib/public-artifacts'

function humanizeLabel(value?: string): string | null {
  if (!value?.trim()) {
    return null
  }

  return value
    .split(/[_-]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function methodTone(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'x:border-emerald-200 x:bg-emerald-500/10 x:text-emerald-700 x:dark:border-emerald-500/30 x:dark:bg-emerald-500/15 x:dark:text-emerald-300'
    case 'POST':
      return 'x:border-sky-200 x:bg-sky-500/10 x:text-sky-700 x:dark:border-sky-500/30 x:dark:bg-sky-500/15 x:dark:text-sky-300'
    case 'DELETE':
      return 'x:border-rose-200 x:bg-rose-500/10 x:text-rose-700 x:dark:border-rose-500/30 x:dark:bg-rose-500/15 x:dark:text-rose-300'
    default:
      return 'x:border-slate-200 x:bg-slate-900/5 x:text-slate-700 x:dark:border-slate-700 x:dark:bg-slate-100/5 x:dark:text-slate-200'
  }
}

function metadataChip(value: string, subdued = false) {
  return (
    <span
      className={[
        'x:inline-flex x:items-center x:rounded-full x:border x:px-2.5 x:py-1 x:text-[0.7rem] x:font-medium x:tracking-[0.02em]',
        subdued
          ? 'x:border-slate-200 x:bg-slate-900/[0.03] x:text-slate-600 x:dark:border-slate-800 x:dark:bg-slate-100/[0.04] x:dark:text-slate-300'
          : 'x:border-sky-200 x:bg-sky-500/10 x:text-sky-700 x:dark:border-sky-500/30 x:dark:bg-sky-500/15 x:dark:text-sky-300'
      ].join(' ')}
    >
      {value}
    </span>
  )
}

export async function PublicApiSurface() {
  const artifact = await getPublicRoutesArtifact()

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
        will render the generated public route list automatically when the artifact is
        added under <code>data/</code>.
      </p>
    )
  }

  if (artifact.routes.length === 0) {
    return (
      <>
        <p>
          <code>{artifact.fileName}</code> was found, but no route entries matched the
          current lightweight parser.
        </p>
        <details>
          <summary>Show raw artifact</summary>
          <pre>{JSON.stringify(artifact.raw, null, 2)}</pre>
        </details>
      </>
    )
  }

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
        . This snapshot is additive and does not replace the authored route guides
        elsewhere in the docs.
      </p>
      <p className="x:mb-4 x:text-sm x:text-slate-600 x:dark:text-slate-300">
        {artifact.routes.length} public{' '}
        {artifact.routes.length === 1 ? 'route' : 'routes'} found.
      </p>
      <div className="x:overflow-x-auto x:rounded-2xl x:border x:border-slate-200 x:bg-white/80 x:shadow-sm x:shadow-slate-950/5 x:backdrop-blur x:dark:border-slate-800 x:dark:bg-slate-950/60">
        <table className="x:min-w-full x:border-separate x:border-spacing-0">
          <caption className="x:sr-only">
            Public API routes generated from the backend artifact.
          </caption>
          <thead>
            <tr className="x:bg-slate-900/[0.03] x:text-left x:dark:bg-slate-100/[0.04]">
              <th className="x:px-5 x:py-3.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Endpoint
              </th>
              <th className="x:px-5 x:py-3.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Details
              </th>
              <th className="x:px-5 x:py-3.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Auth
              </th>
              <th className="x:px-5 x:py-3.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.14em] x:text-slate-500 x:dark:text-slate-400">
                Exposure
              </th>
            </tr>
          </thead>
          <tbody>
            {artifact.routes.map(route => {
              const family = humanizeLabel(route.family)
              const auth = humanizeLabel(route.auth)
              const exposure = humanizeLabel(route.exposure ?? route.visibility)
              const summary = route.summary?.trim() || route.operation?.trim() || 'Route'

              return (
                <tr
                  key={`${route.method}:${route.path}`}
                  className="x:align-top x:[&:not(:last-child)>*]:border-b x:[&:not(:last-child)>*]:border-slate-200 x:[&:not(:last-child)>*]:dark:border-slate-800"
                >
                  <th scope="row" className="x:px-5 x:py-4 x:font-normal">
                    <div className="x:flex x:flex-col x:gap-3">
                      <div className="x:flex x:flex-wrap x:items-center x:gap-2">
                        <span
                          className={[
                            'x:inline-flex x:items-center x:rounded-full x:border x:px-2.5 x:py-1 x:text-[0.7rem] x:font-semibold x:tracking-[0.08em]',
                            methodTone(route.method)
                          ].join(' ')}
                        >
                          {route.method}
                        </span>
                        {family ? metadataChip(family, true) : null}
                        {route.deprecated ? metadataChip('Deprecated') : null}
                      </div>
                      <code className="x:block x:max-w-[32rem] x:overflow-x-auto x:rounded-xl x:bg-slate-950 x:px-3.5 x:py-3 x:text-[0.92rem] x:font-medium x:text-slate-50 x:shadow-inner x:shadow-black/20 x:dark:bg-slate-900">
                        {route.path}
                      </code>
                    </div>
                  </th>
                  <td className="x:px-5 x:py-4">
                    <div className="x:flex x:max-w-[32rem] x:flex-col x:gap-2">
                      <p className="x:m-0 x:text-sm x:font-semibold x:text-slate-900 x:dark:text-slate-50">
                        {summary}
                      </p>
                      {route.notes ? (
                        <p className="x:m-0 x:text-sm x:leading-6 x:text-slate-600 x:dark:text-slate-300">
                          {route.notes}
                        </p>
                      ) : null}
                      {route.operation && route.operation !== route.summary ? (
                        <p className="x:m-0 x:text-xs x:font-medium x:text-slate-500 x:dark:text-slate-400">
                          Operation: <code>{route.operation}</code>
                        </p>
                      ) : null}
                    </div>
                  </td>
                  <td className="x:px-5 x:py-4">
                    <span className="x:text-sm x:text-slate-700 x:dark:text-slate-200">
                      {auth ?? 'None'}
                    </span>
                  </td>
                  <td className="x:px-5 x:py-4">
                    <div className="x:flex x:flex-col x:gap-2">
                      <span className="x:text-sm x:text-slate-700 x:dark:text-slate-200">
                        {exposure ?? 'Standard'}
                      </span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
