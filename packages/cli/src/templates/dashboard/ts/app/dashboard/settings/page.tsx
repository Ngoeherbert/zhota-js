import { Stack, Text, Card } from '@leminejs/widgets'
export const config = { render: 'client' }
export default function SettingsPage() { return <Stack spacing="lg"><Text as="h1" size="3xl" weight="bold">Settings</Text><Card padding="md">Configure your workspace.</Card></Stack> }
