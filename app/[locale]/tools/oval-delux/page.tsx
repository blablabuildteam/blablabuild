import type { Metadata } from 'next';
import OvalDeluxViewer from './OvalDeluxViewer';

export const metadata: Metadata = {
  title: 'Oval Delux — 3D Viewer',
  robots: 'noindex, nofollow',
};

export default function OvalDeluxPage() {
  return <OvalDeluxViewer />;
}
