export const referralSources = [
  { id: 'aisha', name: 'Aisha Group', color: '#8c88ec' },
  { id: 'batu', name: 'Batu Community', color: '#76cbbc' },
  { id: 'general', name: 'ROSE (General)', color: '#ffa29a' },
  { id: 'seri', name: 'Seri Network', color: '#5fcbe1' },
]

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
  return start + ' - ' + end
}

export function eventPath(event) {
  return '/events/' + event.id
}
