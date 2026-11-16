import type { APIRoute } from 'astro';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
);

export const GET: APIRoute = async () => {
  try {
    const { data: slots } = await supabase.from('horarios').select('*');
    const { data: bookings } = await supabase.from('citas').select('*');
    const { data: alerts } = await supabase.from('alertas').select('*');

    return new Response(JSON.stringify({
      slots: slots || [],
      bookings: bookings || [],
      alerts: alerts || []
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error al obtener datos' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { tipo, datos } = body;

    // 1. Guardar alerta desde el Panel de Licenciado
    if (tipo === 'alerta') {
      const { error } = await supabase.from('alertas').insert([datos]);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 2. Guardar horario desde el Panel de Psicóloga
    if (tipo === 'horario') {
      const { error } = await supabase.from('horarios').insert([datos]);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 3. Confirmar cita desde el Panel de Psicóloga
    if (tipo === 'confirmar') {
      const { error } = await supabase
        .from('citas')
        .update({ estado: 'Confirmada' })
        .eq('id', datos.id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), { 
          status: 400, headers: { 'Content-Type': 'application/json' } 
        });
      }
      return new Response(JSON.stringify({ success: true }), { 
        status: 200, headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 4. Guardar cita desde el Panel de Estudiante
    const { error } = await supabase.from('citas').insert([datos || body]);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 400, headers: { 'Content-Type': 'application/json' } 
      });
    }

    return new Response(JSON.stringify({ success: true }), { 
      status: 200, headers: { 'Content-Type': 'application/json' } 
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Error interno en el servidor' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
};