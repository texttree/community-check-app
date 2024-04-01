import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import toast, { Toaster } from 'react-hot-toast'

import useSWR from 'swr'
import axios from 'axios'

import { useTranslation } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

import usfm from 'usfm-js'

import { fetcher } from '@/helpers/fetcher'

import LeftArrow from 'public/left.svg'
import Copy from 'public/copy.svg'

const CheckId = () => {
  const { t } = useTranslation()
  const router = useRouter()
  const { projectId, bookId, checkId } = router.query
  const [errorMessage, setErrorMessage] = useState('')
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16))
  const [materialLink, setMaterialLink] = useState('')
  const [checkName, setCheckName] = useState('')
  const [inspectorName, setInspectorName] = useState('')
  const checkPageRef = useRef(null)
  const [showRef, setShowRef] = useState(false)
  const chapterNumber = 1

  const { data: material } = useSWR(
    projectId &&
      materialLink &&
      bookId &&
      checkId &&
      materialLink &&
      `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/material`,
    fetcher
  )
  const { data: check } = useSWR(
    projectId && bookId && `/api/projects/${projectId}/books/${bookId}/checks/${checkId}`,
    fetcher
  )
  const { data: inspectors, mutate } = useSWR(
    projectId &&
      bookId &&
      `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/inspector`,
    fetcher
  )
  const copyToClipboard = () => {
    const textToCopy = checkPageRef.current.innerText

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast.success(t('copied'))
      },
      (err) => {
        toast.error('Unable to copy text', err)
      }
    )
  }
  useEffect(() => {
    if (check) {
      const formattedFinishedDate = new Date(check.finished_at).toISOString().slice(0, 16)
      setMaterialLink(check.material_link || '')
      setCheckName(check.name)
      if (check.finished_at) {
        setEndDate(formattedFinishedDate)
      }
    }
  }, [checkId, check, material])

  const updateResourse = async () => {
    setErrorMessage('')
    if (checkName && materialLink) {
      await axios
        .get(materialLink)
        .then((res) => {
          const jsonData = usfm.toJSON(res.data)
          if (Object.keys(jsonData?.chapters).length > 0) {
            upsertMaterial(jsonData)
              .then(() => {
                updateCheck()
                setShowRef(true)
                toast.success(t('save'))
              })
              .catch((error) => {
                console.error(error)
                setErrorMessage(error.message)
              })
          } else {
            setErrorMessage(t('enterCorrectLink'))
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
    const postData = { content: jsonData }
    if (material?.id) {
      postData.id = material.id
    }
    return axios
      .post(
        `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/material`,
        postData
      )
      .then((res) => {
        return res.data.id
      })
  }
  const createPersonalLink = async () => {
    try {
      if (inspectorName) {
        await axios.post(
          `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/inspector`,
          {
            inspectorName,
          }
        )

        mutate()
        toast.success(t('inspectorCreated'))
        setErrorMessage('')
      } else {
        setErrorMessage(t('enterInspectorName'))
      }
    } catch (error) {
      setErrorMessage('Произошла ошибка:', error)
    }
  }

  const currentDomain =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'https://community-check-app.netlify.app'

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
            placeholder={t('linkResource')}
            className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
          />
          <label className="block font-medium text-gray-700">{t('expirationDate')}</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
          />
        </div>
        {materialLink !== '' && !showRef && (
          <p className="text-gray-700">{t('saveToShowLink')}</p>
        )}
        {materialLink !== '' && showRef && (
          <div className="flex my-4">
            <Link href={`/checks/${checkId}/chapter/${chapterNumber}`} ref={checkPageRef}>
              {currentDomain}/checks/{checkId}/chapter/
              {chapterNumber}
            </Link>
            <Copy className="h-5 w-5 ml-1 " onClick={copyToClipboard}></Copy>
          </div>
        )}
        <div className="my-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2  my-2 rounded-md"
            onClick={createPersonalLink}
          >
            Add a personal link
          </button>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {errorMessage ? (
            <p className="text-red-600">{errorMessage}</p>
          ) : inspectors ? (
            <div className="flex flex-col">
              {inspectors.map((inspector) => (
                <div key={inspector.id} className="border p-4 mb-4">
                  <p>Name: {inspector.name}</p>

                  <Link
                    href={`/checks/${checkId}/${inspector.id}/chapter/${chapterNumber}`}
                    ref={checkPageRef}
                  >
                    {currentDomain}/checks/{checkId}/{inspector.id}/chapter/
                    {chapterNumber}
                  </Link>

                  <Copy className="h-5 w-5 ml-1 " onClick={copyToClipboard}></Copy>
                </div>
              ))}
            </div>
          ) : (
            <p>{t('loading')}...</p>
          )}
        </div>

        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
          onClick={updateResourse}
        >
          {t('save')}
        </button>
      </div>
      <Toaster />
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
