import { Stack, Text } from '@luminejs/widgets'
import { UsersTable } from '../../../components/UsersTable'
export const config = { render: 'client' }
export default function UsersPage() { return <Stack spacing="lg"><Text as="h1" size="3xl" weight="bold">Users</Text><UsersTable /></Stack> }
