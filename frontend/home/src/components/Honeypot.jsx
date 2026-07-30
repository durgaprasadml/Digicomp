export default function Honeypot({ value, onChange, name = "phone_website" }) {
  return (
    <div className="absolute top-0 left-0 h-0 w-0 opacity-0 pointer-events-none -z-50 overflow-hidden" aria-hidden="true">
      <label htmlFor={name}>Phone or website</label>
      <input
        id={name}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  )
}
