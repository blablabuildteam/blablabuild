import type { Metadata } from 'next';
import AiMatrixTool from './AiMatrixTool';

export const metadata: Metadata = {
  title: 'AI Use Case Matrix — blablabuild',
  robots: 'noindex, nofollow',
};

export default function AiMatrixPage() {
  return <AiMatrixTool />;
}
