import { Grid } from '@luminejs/widgets'
export function StatsRow({ children }) { return <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="md">{children}</Grid> }
