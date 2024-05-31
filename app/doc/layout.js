export const metadata = {
  title: 'Community Check',
  description: 'Project for public inspection',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
