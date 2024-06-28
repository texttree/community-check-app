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
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
      <thead>
        <tr>
          <th className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-left">
            {t('inspectorName')}
          </th>
          <th className="bg-gray-100 border-b border-gray-300 px-4 py-2 text-left">
            {t('personalLink')}
          </th>
          <th className="bg-gray-100 border-b border-gray-300 px-4 py-2"></th>
        </tr>
      </thead>
      <tbody>
        {inspectors.map((inspector) => (
          <tr key={inspector.id}>
            <td className="border-b border-gray-300 px-4 py-2">{inspector.name}</td>
            <td className="border-b border-gray-300 px-4 py-2">
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
            <td className="border-b border-gray-300 px-4 py-2">
              <button
                className="text-red-500 hover:text-red-700 focus:outline-none"
                onClick={() => deleteInspector(inspector.id)}
              >
                {t('delete')}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

export default InspectorTable
