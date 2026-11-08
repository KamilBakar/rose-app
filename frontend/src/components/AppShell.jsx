import { useRef } from 'react'
import Icon from './Icon.jsx'
import { Button } from './ui.jsx'

const publicLinks = [
  { to: '/', label: 'Home', menuLabel: 'Home Page', icon: 'home', menuIcon: 'home-pink' },
  { to: '/bookings', label: 'My Bookings', icon: 'booking' },
  { to: '/events', label: 'Events', icon: 'events' },
  { to: '/about', label: 'About Us', icon: 'about' },
]

const staffLinks = [
  { to: '/staff', label: 'Staff Dashboard', icon: 'person' },
  { to: '/staff/reports', label: 'Reports', icon: 'reports' },
  { to: '/staff/attendance', label: 'Attendance', icon: 'phone', detail: 'Event check-in' },
  { to: '/staff/events/new', label: 'Create/Edit Event', icon: 'plus' },
]

function isCurrent(path, to) {
  if (to === '/' || to === '/staff') return path === to
  return path === to || path.startsWith(to + '/')
}

function NavLink({ path, link, children, ...props }) {
  return (
    <a href={'#' + link.to} aria-current={isCurrent(path, link.to) ? 'page' : undefined} {...props}>
      {children ?? link.label}
    </a>
  )
}

function MenuLink({ link, path, onClick }) {
  return (
    <NavLink path={path} link={link} className="menu-link" onClick={onClick}>
      <span className="menu-link-icon"><Icon name={link.menuIcon ?? link.icon} /></span>
      <span>{link.menuLabel ?? link.label}{link.detail && <small>{link.detail}</small>}</span>
      <Icon name="chevron" />
    </NavLink>
  )
}

export function StaffNav({ path, onSignOut }) {
  return (
    <nav className="staff-nav" aria-label="Staff pages">
      {staffLinks.slice(0, 3).map(link => <NavLink key={link.to} path={path} link={link} />)}
      <button type="button" className="text-button" onClick={onSignOut}>Sign out</button>
    </nav>
  )
}

export default function AppShell({ path, backTo, children }) {
  const menuRef = useRef(null)
  const openMenu = () => menuRef.current.showModal()
  const closeMenu = () => menuRef.current.close()

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main-content" onClick={event => {
        event.preventDefault()
        document.getElementById('main-content').focus()
      }}>Skip to content</a>

      <header className="site-header">
        <div className="site-header-inner">
          <div className="brand-group">
            {backTo && (
              <a className="icon-button back-button" href={'#' + backTo} aria-label="Go back">
                <Icon name="back" />
              </a>
            )}
            <a href="#/" className={'wordmark' + (backTo ? ' wordmark--inline' : '')} aria-label="ROSE Foundation home">
              <strong>ROSE</strong>
              <span>Foundation</span>
            </a>
          </div>

          <nav className="desktop-nav" aria-label="Main navigation">
            {[publicLinks[0], publicLinks[2], publicLinks[1], publicLinks[3]].map(link => (
              <NavLink key={link.to} path={path} link={link} />
            ))}
          </nav>
          <Button to="/staff" variant="outline" className="staff-access">Staff access</Button>
          <button className="icon-button mobile-menu-button" type="button" aria-label="Open menu" onClick={openMenu}>
            <Icon name="menu" />
          </button>
        </div>
      </header>

      <main className="site-main" id="main-content" tabIndex={-1}>{children}</main>

      <nav className="mobile-nav" aria-label="Main navigation">
        {publicLinks.slice(0, 2).map(link => (
          <NavLink key={link.to} path={path} link={link}>
            <Icon name={link.icon} />
            <span>{link.label}</span>
          </NavLink>
        ))}
        <button type="button" onClick={openMenu}>
          <Icon name="more" />
          <span>More</span>
        </button>
      </nav>

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>ROSE Foundation</span>
          <span>Event booking prototype</span>
        </div>
      </footer>

      <dialog className="menu-dialog" ref={menuRef} aria-labelledby="menu-title" onClick={event => {
        if (event.target === event.currentTarget) closeMenu()
      }}>
        <div className="menu-content">
          <div className="menu-heading">
            <h2 id="menu-title">Menu</h2>
            <button type="button" className="icon-button" aria-label="Close menu" onClick={closeMenu}>
              <Icon name="close" />
            </button>
          </div>
          <nav aria-label="Public pages">
            {publicLinks.map(link => <MenuLink key={link.to} path={path} link={link} onClick={closeMenu} />)}
          </nav>
          <p className="menu-section-title">Staff only · Event organisers</p>
          <nav aria-label="Staff pages">
            {staffLinks.map(link => <MenuLink key={link.to} path={path} link={link} onClick={closeMenu} />)}
          </nav>
        </div>
      </dialog>
    </div>
  )
}
