import AppBar from './AppBar'

function Layout({ children }) {
  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div className="max-w-6xl mx-auto p-4">
        <AppBar />
      </div>

      <main>
        <div className="pt-5 px-5 lg:px-8 mt-14 sm:mt-auto">{children}</div>
      </main>
    </div>
  )
}
export default Layout
