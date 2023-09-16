import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import Link from 'next/link'
import { useUser } from '@supabase/auth-helpers-react'

const Index = () => {
  const user = useUser()

  if (user?.email) {
    return (
      <div className="bg-gray-200 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Добро пожаловать в Community Check</h1>
          <p className="text-lg mb-4">Вы уже вошли в систему.</p>
          <Link
            href="/projects"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
          >
            Перейти к проектам
          </Link>
        </div>
      </div>
    )
  }
  return (
    <div className="bg-gray-200 min-h-screen">
      <div className="max-w-6xl mx-auto p-4 text-center">
        <h1 className="text-3xl font-bold mb-4">Добро пожаловать в Community Check</h1>
        <p className="text-lg mb-4">
          Пожалуйста, войдите, чтобы получить доступ к полному функционалу.
        </p>
        <Link
          href="/login"
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md inline-flex items-center"
        >
          Войти
        </Link>
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

export default Index
