import Link from 'next/link'
import { useTranslation } from 'next-i18next'
import useSWR from 'swr'
import { fetcher } from '@/helpers/fetcher'

const CheckList = ({ projectId, bookId }) => {
  const { t } = useTranslation()

  const { data: checks, error } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks`,
    fetcher
  )

  return (
    <>
      <h2 className="text-2xl font-semibold mb-2">{t('bookChecks')}</h2>
      {error ? (
        <p className="text-red-600">{t('errorOccurred')}</p>
      ) : checks ? (
        <div className="bg-white p-4 rounded-lg shadow-md mt-2">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border p-2 text-center">{t('number')}</th>
                <th className="border p-2 text-center">{t('titleInTable')}</th>
                <th className="border p-2 text-center">{t('checkEndDate')}</th>
                <th className="border p-2 text-center">{t('downloadNotes')}</th>
                <th className="border p-2 text-center">{t('activity')}</th>
              </tr>
            </thead>
            <tbody>
              {checks.map((check) => (
                <tr key={check.id}>
                  <td className="border p-2 text-center">{check.id}</td>
                  <td className="border p-2 text-center">
                    <Link
                      href={`/projects/${projectId}/${bookId}/${check.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {check.name}
                    </Link>
                  </td>
                  <td className="border p-2 text-center">{check.id}</td>
                  <td className="border p-2 text-center">{t('download')}</td>
                  <td className="border p-2 text-center">{check.id}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>{t('loading')}</p>
      )}
    </>
  )
}
export default CheckList
