import { Row, Sidebar, SidebarItem, Box } from '@leminejs/widgets'

export default function DashboardLayout({ children }) {
  return (
    <Row style={{ minHeight: '100vh' }}>
      <Sidebar width="240px" collapsible>
        <SidebarItem href="/dashboard" icon="home" label="Overview" />
        <SidebarItem href="/dashboard/users" icon="users" label="Users" />
        <SidebarItem href="/dashboard/settings" icon="settings" label="Settings" />
      </Sidebar>
      <Box padding="lg" style={{ flex: 1 }}>{children}</Box>
    </Row>
  )
}
