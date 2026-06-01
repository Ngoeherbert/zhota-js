import { render } from './render'
export function hydrate(component: unknown, container: Element): () => void { return render(component, container) }
