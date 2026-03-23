import { searchByBarcode, searchByText } from '@/lib/discogs';

export async function POST(request: Request) {
  const body = await request.json();
  const { barcode, query } = body as { barcode?: string; query?: string };

  let record = null;

  if (barcode) {
    record = await searchByBarcode(barcode);
  } else if (query) {
    record = await searchByText(query);
  } else {
    return Response.json({ error: 'barcode or query required' }, { status: 400 });
  }

  if (!record) {
    return Response.json({ error: 'Record not found' }, { status: 404 });
  }

  return Response.json(record);
}
