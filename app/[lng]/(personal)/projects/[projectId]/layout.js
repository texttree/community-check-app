import { languages } from '@/app/i18n/settings'

export async function generateStaticParams() {
  return languages.map((lng) => ({ lng }))
}

export default function ProjectsLayout({ children, params: { lng } }) {
  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg">
        <div className="bg-ming-blue p-3.5 w-full"></div>
        <div className="bg-white">{children}</div>
      </div>
    </div>
  )
}
