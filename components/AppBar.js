import SwitchLanguage from './SwitchLanguage'

const AppBar = () => {
  return (
    <header className="bg-blue-500 p-4 flex justify-between items-center rounded-t-lg">
      <div className="text-white cursor-pointer text-2xl font-bold">Community Check</div>
      <SwitchLanguage />
    </header>
  )
}

export default AppBar
