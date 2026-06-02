import { Table } from '@leminejs/widgets'
import { mockUsers } from '../lib/mock-data'
export function UsersTable() { return <Table rows={mockUsers} /> }
