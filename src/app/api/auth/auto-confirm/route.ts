import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();
    if (!userId && !email) {
      return NextResponse.json({ error: 'Informe userId ou email' }, { status: 400 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
      return NextResponse.json({ error: 'Variáveis do Supabase ausentes' }, { status: 500 });
    }

    const admin = createClient(url, serviceKey);

    let targetUserId = userId as string | undefined;
    if (!targetUserId && email) {
      // Buscar userId via tabela auth.users
      const { data: users, error: findErr } = await admin
        .from('auth.users' as any)
        .select('id')
        .eq('email', email)
        .limit(1);
      if (findErr) {
        return NextResponse.json({ error: findErr.message }, { status: 400 });
      }
      targetUserId = users && users.length > 0 ? (users[0] as any).id : undefined;
      if (!targetUserId) {
        return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
      }
    }

    const { data: updated, error } = await admin.auth.admin.updateUserById(targetUserId!, {
      email_confirm: true,
    } as any);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ ok: true, user: updated.user });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Erro inesperado' }, { status: 500 });
  }
}


