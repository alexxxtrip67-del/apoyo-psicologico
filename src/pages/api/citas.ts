import type { APIRoute } from 'astro';

// Almacenamiento inicial completamente vacío (Sin datos inventados de prueba)
let sharedSlots: any[] = [];
let sharedBookings: any[] = [];
let sharedAlerts: any[] = [];

export const GET: APIRoute = async ({ url }) => {
  return new Response(JSON.stringify({ slots: sharedSlots, bookings: sharedBookings, alerts: sharedAlerts }), { status: 200 });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (action === 'add_slot') {
      sharedSlots.push(payload);
    } else if (action === 'book_slot') {
      const slotIndex = sharedSlots.findIndex((s: any) => s.id === payload.slotId);
      if (slotIndex !== -1) {
        const bookedSlot = sharedSlots.splice(slotIndex, 1)[0];
        sharedBookings.unshift({
          id: Date.now(),
          student: payload.student,
          date: bookedSlot.date,
          time: bookedSlot.time,
          mode: bookedSlot.mode,
          status: 'En espera'
        });
      }
    } else if (action === 'confirm_booking') {
      const idx = sharedBookings.findIndex((b: any) => b.id === payload.id);
      if (idx !== -1) sharedBookings[idx].status = 'Confirmada';
    }

    return new Response(JSON.stringify({ success: true, slots: sharedSlots, bookings: sharedBookings }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
};