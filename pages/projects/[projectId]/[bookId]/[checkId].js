import React, { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import useSWR from 'swr'
import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import usfm from 'usfm-js'
import LeftArrow from 'public/left.svg'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'

const CheckId = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { projectId, bookId, checkId } = router.query
  const [errorMessage, setErrorMessage] = useState('')
  const [hasMaterial, setHasMaterial] = useState(false)
  const [endDate, setEndDate] = useState('')
  const [materialLink, setMaterialLink] = useState('')

  const { data: material, error } = useSWR(
    projectId &&
      bookId &&
      checkId &&
      `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/material`,
    fetcher
  )
  const [checkName, setCheckName] = useState('')
  console.log(router.query)
  const handleSubmit = (e) => {
    e.preventDefault()
  }
  const updateResourse = async () => {
    setErrorMessage('')
    if (checkName && materialLink) {
      await axios
        .get(materialLink)
        .then((res) => {
          const jsonData = usfm.toJSON(res.data)
          if (Object.keys(jsonData?.chapters).length > 0) {
            updateCheck()
              .then(() => {
                return upsertMaterial(jsonData)
              })
              .then((materialId) => {
                console.log(materialId)
              })
              .catch((error) => {
                console.error(error)
                setErrorMessage(error.message)
              })
          } else {
            setErrorMessage('Введите правильную ссылку на ресурс')
          }
        })
        .catch((error) => {
          console.error(error)
          setErrorMessage(error.message)
        })
    } else {
      setErrorMessage(t('nameEmpty'))
    }
  }

  const updateCheck = async () => {
    return await axios.post(
      `/api/projects/${projectId}/books/${bookId}/checks/${checkId}`,
      {
        finished_at: endDate,
        name: checkName,
        material_link: materialLink,
      }
    )
  }
  const upsertMaterial = (jsonData) => {
    const postData = { content: jsonData, deleted_at: endDate }
    if (material?.id) {
      postData.id = material.id
    }
    console.log(postData)
    return axios
      .post(
        `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/material`,
        postData
      )
      .then((res) => {
        const materialId = res.data.id
        return materialId
      })
  }

  return (
    <div className="bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href={`/projects/${projectId}/${bookId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
          {t('back')}
        </Link>
        <Link
          href={`/checks/${checkId}`}
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md
          inline-flex items-center"
        >
          <LeftArrow className="h-5 w-5 mr-1" />
        </Link>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-medium text-gray-700">{t('name')}</label>
            <input
              type="text"
              value={checkName}
              onChange={(e) => setCheckName(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
          </div>
          <div className="mb-4">
            <label className="block font-medium text-gray-700 mt-2">
              {t('provideLink')}
            </label>
            <input
              type="text"
              value={materialLink}
              onChange={(e) => setMaterialLink(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
            <label className="block font-medium text-gray-700">
              {t('expirationDate')}
            </label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
            />
          </div>
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}

          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
            onClick={updateResourse}
          >
            {t('createCheck')}
          </button>
        </form>
      </div>
    </div>
  )
}
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export default CheckId
