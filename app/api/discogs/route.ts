import { searchByBarcode, searchByText } from '@/lib/discogs';

export async function POST(request: Request) {
  const start = Date.now();
  const body = await request.json();
  const { barcode, query } = body as { barcode?: string; query?: string };

  if (!barcode && !query) {
    console.warn('[discogs] missing barcode and query');
    return Response.json({ error: 'barcode or query required' }, { status: 400 });
  }

  const searchType = barcode ? 'barcode' : 'query';
  const searchValue = barcode || query;
  console.log(`[discogs] start | ${searchType}=${searchValue}`);

  try {
    const record = barcode
      ? await searchByBarcode(barcode)
      : await searchByText(query!);

    if (!record) {
      console.warn(`[discogs] not found | ${searchType}=${searchValue} | ${Date.now() - start}ms`);
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    console.log(`[discogs] ok | ${record.artist} - ${record.title} (${record.year}) | ${Date.now() - start}ms`);
    return Response.json(record);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Discogs lookup failed';
    console.error(`[discogs] error | ${searchType}=${searchValue} | ${message} | ${Date.now() - start}ms`, err);
    return Response.json({ error: message }, { status: 500 });
  }
}
