import { Table } from '@luminejs/widgets'
import { mockUsers } from '../lib/mock-data'
export function UsersTable() { return <Table rows={mockUsers} /> }
