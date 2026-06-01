import { Grid } from '@leminejs/widgets'
import { projects } from '../content/projects'
import { ProjectCard } from './ProjectCard'
export function ProjectsGrid() { return <Grid cols={{ sm: 1, md: 2 }} gap="md">{projects.map((project) => <ProjectCard key={project.title} project={project} />)}</Grid> }
