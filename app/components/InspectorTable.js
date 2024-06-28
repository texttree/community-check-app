import Link from 'next/link'
import Copy from '@/public/copy.svg'
import Image from 'next/image'

const InspectorTable = ({
  t,
  inspectors,
  currentDomain,
  lng,
  checkId,
  chapterNumber,
  deleteInspector,
  copyToClipboard,
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border-t rounded-lg shadow-md">
      <thead>
        <tr>
          <th className="px-4 py-2 text-left">{t('nameInspector')}</th>
          <th className="px-4 py-2 text-left">{t('personalLink')}</th>
          <th className="px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {inspectors.map((inspector) => (
          <tr key={inspector.id} className="hover:bg-gray-100">
            <td className="px-4 py-2 w-1/3 text-ming-blue">{inspector.name}</td>
            <td className="px-4 py-2">
              <div className="flex items-center">
                <Link
                  href={`/community-check/${checkId}/${chapterNumber}/${inspector.id}`}
                >
                  {currentDomain}/{lng}/checks/{checkId}/{chapterNumber}/{inspector.id}
                </Link>
                <button
                  className="ml-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={copyToClipboard}
                >
                  <Copy className="h-5 w-5 inline-block" />
                </button>
              </div>
            </td>
            <td className="px-2 sm:px-4 py-4  flex justify-end">
              <button
                onClick={() => deleteInspector(inspector.id)}
                className="hidden sm:block bg-red-500 hover:bg-red-600 text-white px-2 py-1 sm:px-2 sm:py-1 rounded-md"
              >
                {t('delete')}
              </button>
              <Image
                key={inspector.id}
                src="/delete.svg"
                alt="Delete Icon"
                width={24}
                height={24}
                onClick={() => deleteInspector(inspector.id)}
                className="block sm:hidden h-5 w-5 cursor-pointer"
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default InspectorTable
