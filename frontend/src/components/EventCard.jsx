import Icon from './Icon.jsx'
import { eventDate, eventPath, eventTime } from '../data/demo.js'

export function EventThumbnail() {
  // TODO(api): Display the event’s image when the event response includes one.
  return <span className="event-thumbnail"><Icon name="event-image" /></span>
}

function MetadataItem({ icon, children }) {
  return (
    <li>
      <span className={'event-meta-icon event-meta-icon--' + icon}><Icon name={icon} /></span>
      {children}
    </li>
  )
}

export function EventMetadata({ event, includeCapacity = false }) {
  return (
    <ul className="event-meta">
      <MetadataItem icon="calendar"><time dateTime={event.date}>{eventDate(event)}</time></MetadataItem>
      <MetadataItem icon="clock"><span>{eventTime(event)}</span></MetadataItem>
      <MetadataItem icon="location"><span>{event.location}</span></MetadataItem>
      {includeCapacity && <MetadataItem icon="people"><span>{event.capacity} total places</span></MetadataItem>}
    </ul>
  )
}

export default function EventCard({ event }) {
  return (
    <article>
      <a className="event-card" href={'#' + eventPath(event)}>
        <EventThumbnail />
        <div className="event-card-body">
          <h3>{event.title}</h3>
          <EventMetadata event={event} />
        </div>
        <Icon name="chevron" className="event-chevron" />
      </a>
    </article>
  )
}
