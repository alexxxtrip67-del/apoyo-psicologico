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

// <--- Aquí agregas el método POST al final sin tocar lo anterior --->
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { estudiante, fecha, hora, modalidad } = body;

    const { data, error } = await supabase
      .from('citas')
      .insert([{ estudiante, fecha, hora, modalidad }]);

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ success: true, data }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Error al procesar la solicitud' }), { status: 500 });
  }
};