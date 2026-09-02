import { NextResponse } from 'next/server';
import { importLeadsBatch } from '@/actions/os';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const leadsArray = Array.isArray(body) ? body : [body];

    const result = await importLeadsBatch(leadsArray);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `${result.count} leads importados com sucesso.`,
      count: result.count,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Formato JSON inválido ou erro no processamento.', details: err.message },
      { status: 500 }
    );
  }
}
