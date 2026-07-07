import { listModuleIdsWithGuides } from '@/lib/guides';
import GuidesIndexClient from './GuidesIndexClient';

export default function GuidesIndexPage() {
  const availableModuleIds = listModuleIdsWithGuides();
  return <GuidesIndexClient availableModuleIds={availableModuleIds} />;
}
