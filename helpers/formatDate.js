export const formatDate = (dateString) => {
  if (!dateString) {
    return '-'
  }
  const options = { year: 'numeric', month: 'numeric', day: 'numeric' }
  return new Date(dateString).toLocaleDateString(undefined, options)
}
