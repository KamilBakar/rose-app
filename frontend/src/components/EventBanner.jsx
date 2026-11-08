import Icon from './Icon.jsx'

export default function EventBanner({ home = false }) {
  const Heading = home ? 'h1' : 'p'

  return (
    <div className={'event-banner' + (home ? ' event-banner--home' : '')}>
      <div className="banner-art"><Icon name="banner-image" /></div>
      <div className="banner-copy">
        <Heading>Healthier Women<br />Stronger Communities</Heading>
        {home && <p className="banner-description">Find and book a community screening with ROSE Foundation.</p>}
      </div>
    </div>
  )
}
