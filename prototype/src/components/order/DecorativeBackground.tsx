export function DecorativeBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div
        className="absolute -top-1/4 left-1/2 h-[60rem] w-[60rem] -translate-x-1/2 rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--color-primary-bg) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 -right-1/4 h-[40rem] w-[40rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle, var(--color-success-bg) 0%, transparent 70%)',
        }}
      />
    </div>
  )
}
