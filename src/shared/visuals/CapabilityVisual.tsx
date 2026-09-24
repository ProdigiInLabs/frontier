import type { VisualKey } from '@/content/types';
import { AiJourney } from './AiJourney';
import { AssistantWorkspace } from './AssistantWorkspace';
import { AutomationFlow } from './AutomationFlow';
import { IntegrationArchitecture } from './IntegrationArchitecture';
import { ModernizationPath } from './ModernizationPath';
import { ProductArchitecture } from './ProductArchitecture';
import { VisibilityStack } from './VisibilityStack';

const visuals: Record<VisualKey, () => React.ReactElement> = {
  'product-architecture': () => <ProductArchitecture />,
  'modernization-path': () => <ModernizationPath />,
  'visibility-stack': () => <VisibilityStack />,
  'automation-flow': () => <AutomationFlow />,
  'integration-architecture': () => <IntegrationArchitecture />,
  'ai-journey': () => <AiJourney />,
  'assistant-workspace': () => <AssistantWorkspace />,
};

export const visualTitles: Record<VisualKey, string> = {
  'product-architecture': 'How a product is structured',
  'modernization-path': 'Modernization, one component at a time',
  'visibility-stack': 'SEO, AEO and GEO share one foundation',
  'automation-flow': 'How AI automation flows',
  'integration-architecture': 'How intelligence connects to your systems',
  'ai-journey': 'Where do I start? The AI journey',
  'assistant-workspace': 'An assistant grounded in your documents',
};

export function CapabilityVisual({ visual }: { visual: VisualKey }) {
  return visuals[visual]();
}
