/** Parse an API response; a proxy/CDN error page (HTML) becomes a readable message, not "Unexpected token <". */
export async function readApiJson<T = any>(response: Response, fallbackMessage: string): Promise<T> {
  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // non-JSON body; handled below
  }
  if (!response.ok) {
    throw new Error(data?.error || `${fallbackMessage} (HTTP ${response.status})`);
  }
  if (data === null) {
    throw new Error(`${fallbackMessage} Respons server tidak terbaca.`);
  }
  return data as T;
}
