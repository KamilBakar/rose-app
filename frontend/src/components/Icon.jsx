const sources = import.meta.glob('../assets/figma/*.svg', {
  eager: true,
  import: 'default',
  query: '?url',
})

export default function Icon({ name, className = '' }) {
  const source = sources['../assets/figma/' + name + '.svg']
  return <img className={'icon ' + className} src={source} alt="" aria-hidden="true" />
}
