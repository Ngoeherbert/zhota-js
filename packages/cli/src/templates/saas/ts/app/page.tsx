import { Stack, Text, Button } from '@luminejs/widgets'

export default function Home() {
  return (
    <Stack spacing="lg" align="center" style={{ minHeight: '100vh', justifyContent: 'center' }}>
      <Text as="h1" size="4xl" weight="bold">Welcome to LumineJS</Text>
      <Text size="lg" color="muted">Your full-stack JSX framework</Text>
      <Button variant="solid" color="primary">Get Started</Button>
    </Stack>
  )
}
