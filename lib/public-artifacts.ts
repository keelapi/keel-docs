import { promises as fs } from 'node:fs'
import path from 'node:path'

type JsonRecord = Record<string, unknown>

export type ArtifactLoadResult = {
  data: unknown | null
  error: string | null
  exists: boolean
  filePath: string
  fileName: string
}

export type PublicRoute = {
  auth?: string
  deprecated?: boolean
  exposure?: string
  family?: string
  method: string
  notes?: string
  path: string
  summary?: string
  operation?: string
  visibility?: string
}

export type PublicRoutesArtifact = {
  error: string | null
  exists: boolean
  fileName: string
  filePath: string
  generatedAt?: string
  raw: unknown | null
  routes: PublicRoute[]
}

export type ProviderSupportRow = {
  executionsSupported: boolean
  notes?: string
  provider: string
  proxySupported: boolean
  status?: string
  streamingSupported: boolean
  supportedOperations: string[]
  unsupportedOperations: string[]
}

export type ProviderSupportArtifact = {
  error: string | null
  exists: boolean
  fileName: string
  filePath: string
  generatedAt?: string
  raw: unknown | null
  providers: ProviderSupportRow[]
}

const DATA_DIR = path.join(process.cwd(), 'data')

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function getString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function getFirstString(record: JsonRecord, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = getString(record[key])
    if (value) {
      return value
    }
  }

  return undefined
}

function uniqStrings(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))]
}

function getBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.map(getString).filter((item): item is string => Boolean(item))
    : []
}

function extractGeneratedAt(data: unknown): string | undefined {
  if (!isRecord(data)) {
    return undefined
  }

  const direct = getFirstString(data, [
    'generated_at',
    'generatedAt',
    'created_at',
    'createdAt',
    'timestamp'
  ])

  if (direct) {
    return direct
  }

  const metadata = data.metadata
  if (isRecord(metadata)) {
    return getFirstString(metadata, [
      'generated_at',
      'generatedAt',
      'created_at',
      'createdAt',
      'timestamp'
    ])
  }

  return undefined
}

async function loadArtifact(fileName: string): Promise<ArtifactLoadResult> {
  const filePath = path.join(DATA_DIR, fileName)

  try {
    const rawText = await fs.readFile(filePath, 'utf8')
    return {
      data: JSON.parse(rawText) as unknown,
      error: null,
      exists: true,
      filePath,
      fileName
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        data: null,
        error: null,
        exists: false,
        filePath,
        fileName
      }
    }

    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown artifact read error.',
      exists: true,
      filePath,
      fileName
    }
  }
}

function normalizeMethod(value?: string): string {
  return value ? value.toUpperCase() : 'ANY'
}

function extractRouteArrays(data: unknown): unknown[] {
  if (Array.isArray(data)) {
    return data
  }

  if (!isRecord(data)) {
    return []
  }

  const candidateKeys = [
    'routes',
    'public_routes',
    'items',
    'endpoints',
    'paths'
  ]

  for (const key of candidateKeys) {
    const candidate = data[key]
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  return []
}

function normalizeRouteObject(
  item: unknown,
  fallbackPath?: string
): PublicRoute[] {
  if (!isRecord(item)) {
    return []
  }

  const explicitPath = getFirstString(item, [
    'path',
    'route',
    'endpoint',
    'url',
    'pattern'
  ])
  const pathValue = explicitPath ?? fallbackPath

  if (!pathValue) {
    return []
  }

  const methodsValue = item.methods
  const methods = Array.isArray(methodsValue)
    ? methodsValue.map(getString).filter((value): value is string => Boolean(value))
    : []

  const summary = getFirstString(item, [
    'summary',
    'description',
    'title',
    'purpose'
  ])
  const operation = getFirstString(item, ['operation', 'name', 'id'])
  const visibility = getFirstString(item, ['visibility', 'access', 'status'])
  const exposure = getFirstString(item, ['exposure', 'visibility', 'access', 'status'])
  const family = getFirstString(item, ['family', 'group', 'category'])
  const auth = getFirstString(item, ['auth', 'authentication', 'auth_mode'])
  const notes = getFirstString(item, ['notes', 'details'])
  const deprecated =
    getBoolean(item.deprecated) === true ||
    getFirstString(item, ['status'])?.toLowerCase() === 'deprecated'

  if (methods.length > 0) {
    return methods.map(method => ({
      auth,
      deprecated,
      exposure,
      family,
      method: normalizeMethod(method),
      notes,
      operation,
      path: pathValue,
      summary,
      visibility
    }))
  }

  return [
    {
      auth,
      deprecated,
      exposure,
      family,
      method: normalizeMethod(
        getFirstString(item, ['method', 'http_method', 'verb'])
      ),
      notes,
      operation,
      path: pathValue,
      summary,
      visibility
    }
  ]
}

function normalizePublicRoutes(data: unknown): PublicRoute[] {
  const arrayRoutes = extractRouteArrays(data)
    .flatMap(item => normalizeRouteObject(item))
    .filter(route => route.path.startsWith('/'))

  if (arrayRoutes.length > 0) {
    return arrayRoutes.sort((left, right) =>
      `${left.path} ${left.method}`.localeCompare(`${right.path} ${right.method}`)
    )
  }

  if (!isRecord(data)) {
    return []
  }

  return Object.entries(data)
    .flatMap(([key, value]) => {
      if (!key.startsWith('/')) {
        return []
      }

      if (Array.isArray(value)) {
        const methods = value
          .map(getString)
          .filter((method): method is string => Boolean(method))
        return methods.map(method => ({
          method: normalizeMethod(method),
          path: key
        }))
      }

      if (typeof value === 'string') {
        return [
          {
            method: normalizeMethod(value),
            path: key
          }
        ]
      }

      return normalizeRouteObject(value, key)
    })
    .sort((left, right) =>
      `${left.path} ${left.method}`.localeCompare(`${right.path} ${right.method}`)
    )
}

function extractOperationNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqStrings(
      value.flatMap(item => {
        if (typeof item === 'string') {
          return [item]
        }

        if (!isRecord(item)) {
          return []
        }

        const name = getFirstString(item, ['operation', 'name', 'id', 'title'])
        const status = getFirstString(item, ['status', 'support'])

        if (!name) {
          return []
        }

        if (status && ['unsupported', 'disabled', 'no'].includes(status.toLowerCase())) {
          return []
        }

        return [name]
      })
    )
  }

  if (!isRecord(value)) {
    return []
  }

  if ('supported' in value || 'unsupported' in value) {
    return extractOperationNames(value.supported)
  }

  return uniqStrings(
    Object.entries(value).flatMap(([key, supported]) => {
      if (typeof supported === 'boolean') {
        return supported ? [key] : []
      }

      if (isRecord(supported)) {
        const status = getFirstString(supported, ['status', 'support'])
        if (status && ['unsupported', 'disabled', 'no'].includes(status.toLowerCase())) {
          return []
        }

        return [key]
      }

      return []
    })
  )
}

function extractUnsupportedOperationNames(value: unknown): string[] {
  if (Array.isArray(value)) {
    return uniqStrings(
      value.flatMap(item => {
        if (typeof item === 'string') {
          return [item]
        }

        if (!isRecord(item)) {
          return []
        }

        const name = getFirstString(item, ['operation', 'name', 'id', 'title'])
        const status = getFirstString(item, ['status', 'support'])

        if (!name) {
          return []
        }

        if (status && ['supported', 'enabled', 'yes'].includes(status.toLowerCase())) {
          return []
        }

        return [name]
      })
    )
  }

  if (!isRecord(value)) {
    return []
  }

  if ('unsupported' in value) {
    return extractUnsupportedOperationNames(value.unsupported)
  }

  return uniqStrings(
    Object.entries(value).flatMap(([key, supported]) => {
      if (typeof supported === 'boolean') {
        return supported ? [] : [key]
      }

      if (isRecord(supported)) {
        const status = getFirstString(supported, ['status', 'support'])
        if (status && ['unsupported', 'disabled', 'no'].includes(status.toLowerCase())) {
          return [key]
        }
      }

      return []
    })
  )
}

function normalizeProviderRow(
  item: unknown,
  fallbackProvider?: string
): ProviderSupportRow | null {
  if (!isRecord(item)) {
    return null
  }

  const provider = getFirstString(item, ['provider', 'name', 'id']) ?? fallbackProvider

  if (!provider) {
    return null
  }

  const supportedOperations = uniqStrings([
    ...extractOperationNames(item.operations),
    ...extractOperationNames(item.supported_operations),
    ...extractOperationNames(item.supported),
    ...extractOperationNames(item.capabilities)
  ]).sort((left, right) => left.localeCompare(right))

  const unsupportedOperations = uniqStrings([
    ...extractUnsupportedOperationNames(item.operations),
    ...extractUnsupportedOperationNames(item.unsupported_operations),
    ...extractUnsupportedOperationNames(item.unsupported)
  ]).sort((left, right) => left.localeCompare(right))

  const publicSurfaces = getStringArray(item.public_surfaces).map(surface =>
    surface.toLowerCase()
  )
  const executionsOperations = extractOperationNames(item.executions_operations)
  const proxySupported =
    publicSurfaces.includes('proxy') ||
    Boolean(getString(item.proxy_path)) ||
    getBoolean(item.proxy_supported) === true ||
    getBoolean(item.proxy_routing_supported) === true
  const executionsSupported =
    publicSurfaces.includes('executions') ||
    publicSurfaces.includes('execute') ||
    executionsOperations.length > 0 ||
    getBoolean(item.executions_supported) === true ||
    getBoolean(item.execute_supported) === true
  const streamingSupported =
    getBoolean(item.proxy_streaming_supported) === true ||
    getBoolean(item.streaming_supported) === true

  return {
    executionsSupported,
    notes: getFirstString(item, ['notes', 'summary', 'description']),
    provider,
    proxySupported,
    status: getFirstString(item, ['status', 'support', 'availability']),
    streamingSupported,
    supportedOperations,
    unsupportedOperations
  }
}

function normalizeProviderSupport(data: unknown): ProviderSupportRow[] {
  if (Array.isArray(data)) {
    return data
      .map(item => normalizeProviderRow(item))
      .filter((item): item is ProviderSupportRow => item !== null)
      .sort((left, right) => left.provider.localeCompare(right.provider))
  }

  if (!isRecord(data)) {
    return []
  }

  const candidateKeys = ['providers', 'support', 'provider_support', 'items']

  for (const key of candidateKeys) {
    const candidate = data[key]
    if (Array.isArray(candidate)) {
      return normalizeProviderSupport(candidate)
    }

    if (isRecord(candidate)) {
      return Object.entries(candidate)
        .map(([provider, value]) => normalizeProviderRow(value, provider))
        .filter((item): item is ProviderSupportRow => item !== null)
        .sort((left, right) => left.provider.localeCompare(right.provider))
    }
  }

  return Object.entries(data)
    .map(([provider, value]) => normalizeProviderRow(value, provider))
    .filter((item): item is ProviderSupportRow => item !== null)
    .sort((left, right) => left.provider.localeCompare(right.provider))
}

export async function getPublicRoutesArtifact(): Promise<PublicRoutesArtifact> {
  const result = await loadArtifact('public-routes.json')

  return {
    error: result.error,
    exists: result.exists,
    fileName: result.fileName,
    filePath: result.filePath,
    generatedAt: extractGeneratedAt(result.data),
    raw: result.data,
    routes: normalizePublicRoutes(result.data)
  }
}

export async function getProviderSupportArtifact(): Promise<ProviderSupportArtifact> {
  const result = await loadArtifact('provider-support.json')

  return {
    error: result.error,
    exists: result.exists,
    fileName: result.fileName,
    filePath: result.filePath,
    generatedAt: extractGeneratedAt(result.data),
    raw: result.data,
    providers: normalizeProviderSupport(result.data)
  }
}
