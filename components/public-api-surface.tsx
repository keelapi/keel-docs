import { getPublicRoutesArtifact } from '@/lib/public-artifacts'

function formatOptional(value?: string): string {
  return value?.trim() || 'Not specified'
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
      <p>
        Generated from <code>{artifact.fileName}</code>
        {artifact.generatedAt ? ` at ${artifact.generatedAt}` : ''}. This snapshot is
        additive and does not replace the authored route guides elsewhere in the docs.
      </p>
      <p>
        {artifact.routes.length} public {artifact.routes.length === 1 ? 'route' : 'routes'} found.
      </p>
      <table>
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Summary</th>
            <th>Operation</th>
            <th>Visibility</th>
          </tr>
        </thead>
        <tbody>
          {artifact.routes.map(route => (
            <tr key={`${route.method}:${route.path}`}>
              <td>
                <code>{route.method}</code>
              </td>
              <td>
                <code>{route.path}</code>
              </td>
              <td>{formatOptional(route.summary)}</td>
              <td>
                <code>{formatOptional(route.operation)}</code>
              </td>
              <td>{formatOptional(route.visibility)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
