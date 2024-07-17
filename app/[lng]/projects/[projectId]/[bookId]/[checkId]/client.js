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
import CheckPageLink from '@/app/components/CheckLinkCopy'
import { Tab, TabGroup, TabList } from '@headlessui/react'

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
      } catch (error) {
        console.error(error)
        toast.error(error.message)
      }
    } else {
      toast.error(t('provideLink'))
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
    <TabGroup className="max-w-7xl mx-auto mb-5">
      <TabList className="bg-ming-blue flex p-2 border border-th-secondary-300 rounded-t-xl shadow-md">
        <Tab
          className={({ selected }) =>
            selected
              ? 'bg-ming-blue text-white cursor-pointer text-lg sm:text-2xl font-bold px-4 sm:px-9 py-2 rounded-t-md w-full text-center'
              : 'text-blue-100 hover:bg-white/[0.12] hover:text-white px-4 py-2 rounded-t-md w-full text-center'
          }
        >
          {t('')}
        </Tab>
      </TabList>
      <div className="max-w-7xl mx-auto p-4 bg-white rounded-b-md shadow-md">
        <div className="flex items-center mb-4">
          <Link
            href={`/${lng}/projects/${projectId}/${bookId}`}
            className="text-gray-400 hover:text-gray-600 inline-flex items-center"
          >
            <LeftArrow className="h-5 w-5 mr-2 inline-block" />
            {t('back')}
          </Link>
          <h1 className="text-xl font-semibold text-raisin-black ml-4">{checkName}</h1>
        </div>

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
        {checkName !== '' && (
          <CheckPageLink
            lng={lng}
            checkId={checkId}
            chapterNumber={chapterNumber}
            currentDomain={currentDomain}
            copyToClipboard={copyToClipboard}
            t={t}
            ref={checkPageRef}
          />
        )}

        <div className="flex flex-col space-y-4 md:hidden">
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
        <div className="hidden md:flex md:flex-row md:space-x-4">
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

        {inspectors && inspectors.length > 0 && (
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
        )}
        <DeleteModal
          lng={lng}
          isOpen={showDeleteModal}
          message={t('confirmDeleteInspector')}
          onConfirm={confirmDeleteInspector}
          onCancel={cancelDeleteInspector}
          onKeep={keepInspector}
          showKeepButton={true}
        />
      </div>
    </TabGroup>
  )
}

export default CheckId
