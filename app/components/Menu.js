import { Children, cloneElement, useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const Menu = ({ children }) => {
  const menuRef = useRef(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleMenuToggle = () => {
    setIsMenuOpen((prev) => !prev)
  }

  const handleMenuClick = (childClickHandler) => {
    if (childClickHandler) {
      childClickHandler()
    }
    setIsMenuOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuRef])

  const childrenWithClasses = Children.map(children, (child) => {
    return cloneElement(child, {
      className: `block w-full text-left px-2 py-1 text-sm text-raisin-black hover:bg-gray-100 hover:text-black`,
      onClick: () => handleMenuClick(child.props.onClick),
    })
  })

  return (
    <>
      <div className="hidden md:flex space-x-2">{children}</div>
      <div className="md:hidden flex justify-end">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button onClick={handleMenuToggle} className="p-2">
            <Image src="/menu.svg" alt="Menu" width={24} height={24} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-max origin-top-right bg-white divide-y divide-gray-100 rounded-sm overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div className="py-1">{childrenWithClasses}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Menu
