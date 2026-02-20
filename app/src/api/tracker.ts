export interface ApiCallRecord {
  endpoint: string
  source: string
  status: number
  time: string
  durationMs: number
  records: number
}

export function trackApiCall(
  endpoint: string,
  status: number,
  durationMs: number,
  records = 0,
) {
  // Extract source name from the endpoint prefix
  const source = endpoint.split(':')[0] ?? 'Unknown'
  window.dispatchEvent(
    new CustomEvent('api-call', {
      detail: {
        endpoint,
        source,
        status,
        time: new Date().toISOString(),
        durationMs,
        records,
      } satisfies ApiCallRecord,
    }),
  )
}
