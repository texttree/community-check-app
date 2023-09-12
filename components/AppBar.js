import SwitchLanguager from './SwitchLanguager'
const AppBar = () => {
  return (
    <header className="bg-blue-500 p-4 flex justify-between items-center">
      <div className="text-white cursor-pointer"></div>
      <SwitchLanguager />
    </header>
  )
}

export default AppBar
