import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const GET: APIRoute = async () => {
  const { data: slots } = await supabase.from('horarios').select('*');
  const { data: bookings } = await supabase.from('citas').select('*');
  const { data: alerts } = await supabase.from('alertas').select('*');

  return new Response(JSON.stringify({
    slots: slots || [],
    bookings: bookings || [],
    alerts: alerts || []
  }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add_slot') {
      await supabase.from('horarios').insert([{
        id: Date.now(),
        fecha: payload.date,
        hora: payload.time,
        modalidad: payload.mode
      }]);
    } else if (action === 'book_slot') {
      await supabase.from('horarios').delete().eq('id', payload.slotId);
      await supabase.from('citas').insert([{
        id: Date.now(),
        estudiante: payload.student,
        fecha: payload.date,
        hora: payload.time,
        modalidad: payload.mode,
        estado: 'En espera'
      }]);
    } else if (action === 'confirm_booking') {
      await supabase.from('citas').update({ estado: 'Confirmada' }).eq('id', payload.id);
    } else if (action === 'add_teacher_report') {
      await supabase.from('alertas').insert([{
        id: Date.now(),
        estudiante: payload.student,
        motivo: `Reporte de Licenciado (${payload.licenciado}): ${payload.comment}`,
        fecha: new Date().toLocaleDateString()
      }]);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
};