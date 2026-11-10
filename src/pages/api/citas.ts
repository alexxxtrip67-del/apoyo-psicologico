import type { APIRoute } from 'astro';

let sharedSlots: any[] = [
  { id: 101, date: "Martes 10 de Noviembre", time: "10:00 AM - 10:45 AM", mode: "Presencial - Cubículo 2" },
  { id: 102, date: "Jueves 12 de Noviembre", time: "03:00 PM - 03:45 PM", mode: "Virtual - Zoom" }
];
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
      sharedSlots = sharedSlots.filter((s: any) => s.id !== payload.slotId);
      sharedBookings.unshift(payload.booking);
    } else if (action === 'confirm_booking') {
      const idx = sharedBookings.findIndex((b: any) => b.id === payload.id);
      if (idx !== -1) sharedBookings[idx].status = 'Confirmada';
    } else if (action === 'add_alert') {
      sharedAlerts.unshift(payload);
    }

    return new Response(JSON.stringify({ success: true, slots: sharedSlots, bookings: sharedBookings }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false }), { status: 400 });
  }
};