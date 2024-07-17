import React from 'react'

function Modal({ title = '', children }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/10 backdrop-blur-lg z-40"></div>
      <div className="fixed inset-0 flex items-center justify-center z-40">
        <div className={`bg-white p-5 rounded-lg shadow-lg m-4 max-w-lg w-full`}>
          <h2 className="text-lg font-bold mb-5">{title}</h2>
          {children}
        </div>
      </div>
    </>
  )
}

export default Modal
