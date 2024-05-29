const CustomError = ({ statusCode, title }) => (
  <div className="flex items-center justify-center min-h-screen bg-gray-200">
    <div className="text-center">
      <p className="text-4xl text-black">{statusCode}</p>
      <p className="text-2xl text-black">{title}</p>
    </div>
  </div>
)

export default CustomError
