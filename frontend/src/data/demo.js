// some fixtures to replace the event, booking and referral API responses.
export const referralSources = [
  { id: 'aisha', name: 'Aisha Group', color: '#8c88ec' },
  { id: 'batu', name: 'Batu Community', color: '#76cbbc' },
  { id: 'general', name: 'ROSE (General)', color: '#ffa29a' },
  { id: 'seri', name: 'Seri Network', color: '#5fcbe1' },
]

export const demoEvents = [
  {
    id: 'womens-health-screening',
    title: "Women's Health Screening",
    date: '2026-10-12',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Community Center A',
    description: 'Free health screening for eligible women. Book a place to attend the screening session at Community Center A.',
    capacity: 100,
    referralCounts: { aisha: 32, batu: 24, general: 12, seri: 6 },
    waiting: 0,
  },
  {
    id: 'cervical-screening-day',
    title: 'Cervical Screening Day',
    date: '2026-10-25',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Community Center A',
    description: 'A community cervical screening session for eligible women. You can join the waiting list for this session.',
    capacity: 100,
    referralCounts: { aisha: 44, batu: 27, general: 22, seri: 7 },
    waiting: 3,
  },
  {
    id: 'breast-health-awareness',
    title: 'Breast Health Awareness',
    date: '2026-11-09',
    startTime: '09:00',
    endTime: '12:00',
    location: 'Community Center A',
    description: 'A community event for eligible women to learn about breast health and speak with the ROSE team.',
    capacity: 100,
    referralCounts: { aisha: 8, batu: 8, general: 21, seri: 5 },
    waiting: 0,
  },
]

export const demoBookings = [
  'Demo Participant',
  'John Doe',
  'Jane Smith',
  'Emily Davis',
  'Mary Johnson',
  'Patrick Star',
].map((name, index) => ({
  reference: index === 0 ? 'ROSE-REF12345' : 'ROSE-SAMPLE-' + index,
  eventId: demoEvents[0].id,
  name,
  phone: '012 000 000' + (index + 1),
  referral: 'general',
  status: 'confirmed',
  attended: false,
}))

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
})

const timeFormat = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric', minute: '2-digit', timeZone: 'UTC',
})

export function eventDate(event) {
  return dateFormat.format(new Date(event.date + 'T00:00:00Z'))
}

export function eventTime(event) {
  const start = timeFormat.format(new Date(event.date + 'T' + event.startTime + ':00Z'))
  const end = timeFormat.format(new Date(event.date + 'T' + event.endTime + ':00Z'))
  return start + ' – ' + end
}

export function eventPath(event) {
  return '/events/' + event.id
}

export function withEventCounts(event, bookings) {
  const referrals = { ...event.referralCounts }
  let waitlist = event.waiting

  for (const booking of bookings) {
    if (booking.eventId !== event.id) continue
    if (booking.status === 'confirmed') {
      referrals[booking.referral] = (referrals[booking.referral] ?? 0) + 1
    }
    if (booking.status === 'waiting') waitlist += 1
  }

  const booked = Object.values(referrals).reduce((total, count) => total + count, 0)
  return { ...event, booked, waitlist, referrals, remaining: Math.max(0, event.capacity - booked) }
}
