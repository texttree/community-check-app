const Loader = ({ line = ['h-2.5 w-48'], className = '' }) => {
  return (
    <div role="status" className={`${className} animate-pulse`}>
      {line.map((size, index) => (
        <div key={index} className={`bg-bright-gray rounded-full ${size}`}></div>
      ))}
    </div>
  )
}

export default Loader
