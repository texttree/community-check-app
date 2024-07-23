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
      <div className="md:hidden flex justify-end relative">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button onClick={handleMenuToggle}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2"
              stroke="currentColor"
              className="w-8 h-8 p-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
              ></path>
            </svg>
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-max origin-top-right bg-white divide-y divide-gray-100 rounded-sm overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
              <div>{childrenWithClasses}</div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Menu
