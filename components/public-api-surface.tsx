import { getPublicRoutesArtifact } from '@/lib/public-artifacts'

function getRouteSummary(summary?: string, operation?: string, notes?: string): string {
  return summary?.trim() || operation?.trim() || notes?.trim() || 'Route'
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
      <div className="x:overflow-x-auto">
        <table className="x:min-w-full x:border-collapse x:text-sm">
          <caption className="x:sr-only">
            Public API routes generated from the backend artifact.
          </caption>
          <thead>
            <tr className="x:border-b x:border-slate-200 x:text-left x:dark:border-slate-800">
              <th className="x:px-3 x:py-2.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Method
              </th>
              <th className="x:px-3 x:py-2.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Path
              </th>
              <th className="x:px-3 x:py-2.5 x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-500 x:dark:text-slate-400">
                Summary
              </th>
            </tr>
          </thead>
          <tbody>
            {artifact.routes.map(route => {
              const summary = getRouteSummary(route.summary, route.operation, route.notes)

              return (
                <tr
                  key={`${route.method}:${route.path}`}
                  className="x:border-b x:border-slate-200 x:last:border-b-0 x:dark:border-slate-800"
                >
                  <th
                    scope="row"
                    className="x:px-3 x:py-3 x:font-mono x:text-xs x:font-semibold x:uppercase x:tracking-[0.08em] x:text-slate-700 x:dark:text-slate-200"
                  >
                    {route.method}
                  </th>
                  <td className="x:px-3 x:py-3">
                    <code className="x:text-[0.95rem] x:text-slate-900 x:dark:text-slate-100">
                      {route.path}
                    </code>
                  </td>
                  <td className="x:px-3 x:py-3">
                    <div className="x:max-w-[34rem] x:space-y-1">
                      <p className="x:m-0 x:text-sm x:text-slate-900 x:dark:text-slate-50">
                        {summary}
                      </p>
                      {route.deprecated ? (
                        <p className="x:m-0 x:text-xs x:text-slate-500 x:dark:text-slate-400">
                          Deprecated.
                        </p>
                      ) : null}
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
