import { useRef } from 'react'

import Link from 'next/link'

import Copy from '@/public/copy.svg'

const InspectorTable = ({
  t,
  inspectors,
  currentDomain,
  lng,
  checkId,
  chapterNumber,
  deleteInspector,
  copyToClipboard,
}) => {
  const linkRefs = useRef({})

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-t sm:border-t-0 bg-white text-sm mb-8">
        <thead>
          <tr className="border-b text-left">
            <th className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4">{t('nameInspector')}</th>
            <th className="p-2 sm:p-4">{t('personalLink')}</th>
            <th className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4"></th>
          </tr>
        </thead>
        <tbody>
          {inspectors.map((inspector) => {
            const link = `${currentDomain}/${lng}/checks/${checkId}/${chapterNumber}/${inspector.id}`
            return (
              <tr key={inspector.id} className="border-b sm:hover:bg-ming-blue/10">
                <td className="pl-4 py-2 pr-2 sm:pr-4 sm:py-4 border-r sm:border-r-0">
                  <span className="text-cell">{inspector.name}</span>
                </td>
                <td className="p-2 sm:p-4 border-r sm:border-r-0 max-w-[50vw]">
                  <div className="flex items-center">
                    <Link
                      href={`/checks/${checkId}/${chapterNumber}/${inspector.id}`}
                      ref={(el) => (linkRefs.current[inspector.id] = el)}
                      className="link-cell truncate"
                    >
                      {link}
                    </Link>
                    <button
                      className="disabled:opacity-50 disabled:cursor-not-allowed h-5 w-5"
                      onClick={() => copyToClipboard(link)}
                    >
                      <Copy className="h-5 w-5" />
                    </button>
                  </div>
                </td>
                <td className="pr-4 py-2 pl-2 sm:pl-4 sm:py-4 flex justify-center sm:justify-end">
                  <div
                    onClick={() => deleteInspector(inspector.id)}
                    className="text-red-500 bg-bright-gray px-2 py-1 rounded-md text-sm font-normal focus:outline-none cursor-pointer sm:bg-red-500 sm:hover:bg-red-600 sm:text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="block sm:hidden h-4 w-4 cursor-pointer"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    <span className="hidden sm:block">{t('delete')}</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default InspectorTable
