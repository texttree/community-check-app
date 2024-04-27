import FormComponent from './client'

export default async function LoginPage({
  params: { lng },
  searchParams: { redirectedFrom },
}) {
  return <FormComponent lng={lng} redirectedFrom={redirectedFrom} />
}
