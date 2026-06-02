import './globals.css'
import { ThemeProvider } from '@leminejs/widgets'

export default function RootLayout({ children }: { children: unknown }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
