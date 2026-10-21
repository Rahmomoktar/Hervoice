const API = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
export async function call(path, method = 'GET', body, token) {
  let response;
  try {
    response = await fetch(API + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? {
          Authorization: 'Bearer ' + token
        } : {})
      },
      body: body ? JSON.stringify(body) : undefined
    });
  } catch {
    throw Error('Cannot reach the API. Check that the backend is running and reload this page.');
  }
  const data = await response.json().catch(() => ({error: 'The API returned an invalid response. Check the backend server.'}));
  if (response.status === 429) {
    const seconds=Number(response.headers.get('Retry-After'));
    const wait=Number.isFinite(seconds)&&seconds>0?' Try again in '+Math.ceil(seconds/60)+' minute(s).':'';
    throw Error((data.error||'Request limit reached.')+wait);
  }
  if (!response.ok) throw Error(data.error || 'Request failed');
  return data;
}
