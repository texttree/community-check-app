'use client'

import { useState, useEffect, useRef } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import toast from 'react-hot-toast'

import useSWR from 'swr'
import axios from 'axios'

import usfm from 'usfm-js'

import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import Copy from '@/public/copy.svg'
import { parsingWordText } from '@/helpers/usfmHelper'
import { useTranslation } from '@/app/i18n/client'
import DeleteModal from '@/app/components/DeleteModal'

const CheckId = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId, bookId, checkId } = useParams()
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16))
  const [materialLink, setMaterialLink] = useState('')
  const [checkName, setCheckName] = useState('')
  const [inspectorName, setInspectorName] = useState('')
  const checkPageRef = useRef(null)
  const chapterNumber = 1

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInspectorId, setSelectedInspectorId] = useState(null)

  const { data: material } = useSWR(
    projectId &&
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

  const deleteInspector = async (inspectorId) => {
    setSelectedInspectorId(inspectorId)
    try {
      const response = await axios.get(`/api/info_notes/${inspectorId}`)
      if (response.data) {
        openDeleteModal(inspectorId)
      } else {
        deleteInspectorApi(inspectorId, false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const openDeleteModal = (inspectorId) => {
    setSelectedInspectorId(inspectorId)
    setShowDeleteModal(true)
  }

  const confirmDeleteInspector = async () => {
    if (selectedInspectorId) {
      deleteInspectorApi(selectedInspectorId, true)
    }
    setShowDeleteModal(false)
  }

  const cancelDeleteInspector = () => {
    if (selectedInspectorId) {
      deleteInspectorApi(selectedInspectorId, false)
    }
    setShowDeleteModal(false)
  }

  const copyToClipboard = () => {
    const textToCopy = checkPageRef.current.innerText

    navigator.clipboard.writeText(textToCopy).then(
      () => {
        toast.success(t('copied'))
      },
      (err) => {
        toast.error(t('copyError'), err)
      }
    )
  }
  useEffect(() => {
    if (check) {
      const currentDate = new Date().toISOString().slice(0, 16)
      const formattedStartedDate = check.started_at
        ? new Date(check.started_at).toISOString().slice(0, 16)
        : currentDate
      const formattedFinishedDate = check.finished_at
        ? new Date(check.finished_at).toISOString().slice(0, 16)
        : currentDate

      setStartDate(formattedStartedDate)
      setEndDate(formattedFinishedDate)

      setMaterialLink(check.material_link || '')
      setCheckName(check.name)
    }
  }, [check])

  const updateResourse = async () => {
    if (materialLink) {
      try {
        const res = await axios.get(materialLink)
        const jsonData = parsingWordText(usfm.toJSON(res.data))
        if (Object.keys(jsonData?.chapters).length > 0) {
          await upsertMaterial(jsonData)
          await updateCheck()
          toast.success(t('save'))
        } else {
          toast.error(t('enterCorrectLink'))
        }
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    } else {
      toast.error(t('provideLink'))
    }
  }

  const updateCheck = async () => {
    try {
      await axios.post(`/api/projects/${projectId}/books/${bookId}/checks/${checkId}`, {
        started_at: startDate,
        finished_at: endDate,
        name: checkName,
        material_link: materialLink,
      })
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const upsertMaterial = async (jsonData) => {
    try {
      const postData = { content: jsonData }
      if (material?.id) {
        postData.id = material.id
      }
      const res = await axios.post(
        `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/material`,
        postData
      )
      return res.data.id
    } catch (error) {
      console.error(error)
      toast.error(error.message)
    }
  }

  const createPersonalLink = async () => {
    try {
      if (inspectorName) {
        await axios.post(
          `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/inspector`,
          { inspectorName }
        )
        mutate()
        toast.success(t('inspectorCreated'))
      } else {
        toast.error(t('enterInspectorName'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('errorCreatingInspector'))
    }
  }

  const deleteInspectorApi = async (inspectorId, p_delete_notes) => {
    try {
      await axios.delete(
        `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/inspector`,
        { data: { inspectorId, p_delete_notes } }
      )
      mutate()
      toast.success(t('inspectorDeleted'))
    } catch (error) {
      console.error(error)
      toast.error(t('errorDeletingInspector'))
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
          href={`/${lng}/projects/${projectId}/${bookId}`}
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
            className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-full"
          />
          <label className="block font-medium text-gray-700">{t('startingDate')}</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
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
        {checkName !== '' && (
          <div className="flex my-4">
            <Link href={`/${lng}/checks/${checkId}/${chapterNumber}`} ref={checkPageRef}>
              {currentDomain}/{lng}/checks/{checkId}/{chapterNumber}
            </Link>
            <Copy className="h-5 w-5 ml-1 " onClick={copyToClipboard}></Copy>
          </div>
        )}
        <button
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-block"
          onClick={updateResourse}
        >
          {t('updateInformation')}
        </button>
        <br />
        <br />
        <div className="my-2">
          <label className="block font-medium text-gray-700">{t('nameInspector')}</label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => setInspectorName(e.target.value)}
            className="mt-1 px-2 py-1 block rounded-lg border border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 w-auto"
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 my-2 rounded-md"
            onClick={createPersonalLink}
          >
            {t('addPersonalLink')}
          </button>
        </div>

        {inspectors?.length > 0 && (
          <div>
            <table className="w-full rounded-lg border border-gray-300">
              <thead>
                <tr>
                  <th className="bg-white border border-gray-300 px-4 py-2">
                    {t('nameInspector')}
                  </th>
                  <th className=" bg-white border border-gray-300 px-4 py-2">
                    {t('personalLink')}
                  </th>
                  <th className="bg-white border border-gray-300 px-4 py-2">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {inspectors.map((inspector) => (
                  <tr key={inspector.id}>
                    <td className=" bg-white border border-gray-300 px-4 py-2">
                      {inspector.name}
                    </td>
                    <td className=" bg-white border border-gray-300 px-4 py-2">
                      <div className="flex items-center">
                        <Link
                          href={`/${lng}/checks/${checkId}/${chapterNumber}/${inspector.id}`}
                          ref={checkPageRef}
                        >
                          {currentDomain}/{lng}/{checkId}/{chapterNumber}/{inspector.id}
                        </Link>
                        <Copy
                          className="h-5 w-5 ml-1 cursor-pointer"
                          onClick={copyToClipboard}
                        ></Copy>
                      </div>
                    </td>
                    <td className="bg-white border border-gray-300 px-4 py-2">
                      <button
                        className="text-red-600 hover:text-red-800"
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
        )}
      </div>
      {showDeleteModal && (
        <DeleteModal
          isVisible={showDeleteModal}
          message={t('confirmDeleteInspector')}
          onConfirm={confirmDeleteInspector}
          onCancel={cancelDeleteInspector}
          confirmText={t('delete')}
          cancelText={t('keep')}
        />
      )}
    </div>
  )
}

export default CheckId
