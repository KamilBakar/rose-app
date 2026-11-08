import { useId } from 'react'
import Icon from './Icon.jsx'

export function Button({ to, variant = 'primary', className = '', children, ...props }) {
  const classes = 'button button--' + variant + ' ' + className

  if (to) {
    return <a className={classes} href={'#' + to} {...props}>{children}</a>
  }

  return <button type="button" className={classes} {...props}>{children}</button>
}

export function PageHeading({ title, description, eyebrow, children }) {
  return (
    <header className="page-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {children}
    </header>
  )
}

export function Field({ label, hint, icon, options, multiline, hideLabel, end, ...props }) {
  const id = useId()
  const common = { id, 'aria-describedby': hint ? id + '-hint' : undefined, ...props }

  return (
    <div className="field">
      <label className={hideLabel ? 'sr-only' : 'field-label'} htmlFor={id}>{label}</label>
      <div className={'field-control' + (icon ? ' field-control--icon' : '') + (end ? ' field-control--end' : '')}>
        {icon && <Icon name={icon} className="field-icon" />}
        {options ? (
          <select {...common}>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : multiline ? (
          <textarea {...common} />
        ) : (
          <input {...common} />
        )}
        {end}
      </div>
      {hint && <p id={id + '-hint'} className="field-hint">{hint}</p>}
    </div>
  )
}

export function EmptyState({ title, children, to, action }) {
  return (
    <section className="panel empty-state">
      <h2>{title}</h2>
      {children && <p>{children}</p>}
      {to && <Button to={to} variant="outline">{action}</Button>}
    </section>
  )
}
