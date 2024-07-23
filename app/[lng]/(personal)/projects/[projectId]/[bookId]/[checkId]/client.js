'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import toast from 'react-hot-toast'
import useSWR from 'swr'
import axios from 'axios'
import { fetcher } from '@/helpers/fetcher'
import LeftArrow from '@/public/left.svg'
import { useTranslation } from '@/app/i18n/client'
import DeleteModal from '@/app/components/DeleteModal'
import CheckInfoForm from '@/app/components/CheckInfoForm'
import MaterialLinkForm from '@/app/components/MaterialLinkForm'
import InspectorForm from '@/app/components/InspectorForm'
import InspectorTable from '@/app/components/InspectorTable'
import Loader from '@/app/components/Loader'
import { useRouter } from 'next/navigation'

const CheckEditPage = ({ lng }) => {
  const { t } = useTranslation(lng, 'common')
  const { projectId, bookId, checkId } = useParams()
  const { push } = useRouter()
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 16))
  const [materialLink, setMaterialLink] = useState('')
  const [checkName, setCheckName] = useState('')
  const [inspectorName, setInspectorName] = useState('')
  const checkPageRef = useRef(null)
  const chapterNumber = 1

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedInspectorId, setSelectedInspectorId] = useState(null)

  const { data: check, mutate: mutateCheck } = useSWR(
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
      const response = await axios.get(`/api/inspectors/${inspectorId}`)
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
    setShowDeleteModal(false)
  }

  const keepInspector = () => {
    if (selectedInspectorId) {
      deleteInspectorApi(selectedInspectorId, false)
    }
    setShowDeleteModal(false)
  }

  const copyToClipboard = (textToCopy) => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy).then(
        () => {
          toast.success(t('copied'))
        },
        (err) => {
          toast.error(t('copyError'), err)
        }
      )
    } else {
      toast.error(t('copyError'))
    }
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

  const updateContent = async () => {
    if (materialLink) {
      try {
        await axios.post('/api/materials/', {
          materialLink: materialLink,
          checkId: checkId,
        })
        toast.success(t('updatedContent'))
        return true
      } catch (error) {
        console.error(error)
        toast.error(error.message)
        return false
      }
    } else {
      toast.error(t('provideLink'))
      return false
    }
  }

  const updateCheckInfo = async () => {
    try {
      await axios.post(`/api/projects/${projectId}/books/${bookId}/checks/${checkId}`, {
        started_at: startDate,
        finished_at: endDate,
        name: checkName,
      })
      toast.success(t('updatedInformation'))
      mutateCheck()
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
          { name: inspectorName }
        )
        mutate()
        setInspectorName('')
        toast.success(t('inspectorCreated'))
      } else {
        toast.error(t('enterInspectorName'))
      }
    } catch (error) {
      console.error(error)
      toast.error(t('errorCreatingInspector'))
    }
  }

  const deleteInspectorApi = async (inspectorId, delete_all_notes) => {
    try {
      await axios.delete(
        `/api/projects/${projectId}/books/${bookId}/checks/${checkId}/inspector`,
        { data: { id: inspectorId, delete_all_notes } }
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
    <>
      <div>
        <div className="flex justify-between items-center border-b p-4">
          <div className="flex justify-start space-x-1 sm:space-x-4">
            <Link
              href={`/${lng}/projects/${projectId}/${bookId}`}
              className="text-gray-400 hover:text-gray-500 inline-flex items-center text-sm"
            >
              <LeftArrow className="h-4 w-4 mr-1" />
              <span className="hidden sm:block">{t('checks')}</span>
            </Link>
            <h1 className="text-base sm:text-lg font-bold pl-0 sm:pl-3 border-0 sm:border-l">
              {check ? check.name : <Loader line={['h-5 my-1 w-48']} />}
            </h1>
          </div>
        </div>
        <div className="p-4 border-b">
          <CheckInfoForm
            t={t}
            checkName={checkName}
            setCheckName={setCheckName}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            updateCheckInfo={updateCheckInfo}
          />
        </div>
        <div className="p-4 border-b">
          <h2 className="text-base font-bold mb-4">{t('LinkToCheck')}</h2>
          {checkName !== '' ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                onClick={() => push(`/checks/${checkId}/${chapterNumber}`)}
                className="input w-full cursor-pointer"
                value={`${currentDomain}/${lng}/checks/${checkId}/${chapterNumber}`}
                readOnly
              />
              <button
                className="button-base button-primary sm:ml-2 mt-2 sm:mt-0 self-start"
                onClick={() =>
                  copyToClipboard(
                    `${currentDomain}/${lng}/checks/${checkId}/${chapterNumber}`
                  )
                }
              >
                {t('copy')}
              </button>
            </div>
          ) : (
            <Loader line={['h-6 my-2 w-full']} />
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <MaterialLinkForm
              t={t}
              materialLink={materialLink}
              setMaterialLink={setMaterialLink}
              updateContent={updateContent}
            />
            <InspectorForm
              t={t}
              inspectorName={inspectorName}
              setInspectorName={setInspectorName}
              createPersonalLink={createPersonalLink}
            />
          </div>
        </div>
        {inspectors && inspectors.length > 0 && (
          <div className="p-4">
            <InspectorTable
              t={t}
              inspectors={inspectors}
              lng={lng}
              checkId={checkId}
              chapterNumber={chapterNumber}
              currentDomain={currentDomain}
              copyToClipboard={copyToClipboard}
              deleteInspector={deleteInspector}
              checkPageRef={checkPageRef}
            />
          </div>
        )}
      </div>
      <DeleteModal
        lng={lng}
        isOpen={showDeleteModal}
        message={t('confirmDeleteInspector')}
        onConfirm={confirmDeleteInspector}
        onCancel={cancelDeleteInspector}
        onKeep={keepInspector}
        showKeepButton={true}
      />
    </>
  )
}

export default CheckEditPage
