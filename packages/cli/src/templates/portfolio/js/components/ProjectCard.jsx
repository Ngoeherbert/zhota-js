import { Card, Text } from '@luminejs/widgets'
export function ProjectCard({ project }) { return <Card padding="md"><Text as="h2" size="xl" weight="bold">{project.title}</Text><Text>{project.description}</Text></Card> }
