import { aiClient } from '@/core/services/ai/ai-client';
import { Badge } from '@/shared/components/Badge';

/** "Demo mode" in demo; nothing when a backend is connected. */
export function ModeBadge() {
  return aiClient.mode === 'demo' ? <Badge tone="demo">Demo mode</Badge> : null;
}
