import { Stack, Text, Grid, Stat, Card } from '@luminejs/widgets'
import { mockStats } from '../../lib/mock-data'

export const config = { render: 'client' }

export default function DashboardHome() {
  return <Stack spacing="xl"><Text as="h1" size="3xl" weight="bold">Overview</Text><Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="md">{mockStats.map((stat) => <Card key={stat.label} padding="md" shadow="sm"><Stat label={stat.label} value={stat.value} delta={stat.delta} deltaType={stat.deltaType} /></Card>)}</Grid></Stack>
}
