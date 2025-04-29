// components/tiptap/TiptapEditorWrapper.tsx
'use client';

import dynamic from 'next/dynamic';

const TiptapEditor = dynamic(() => import('./TiptapEditorWithToolbar'), {
  ssr: false,
  loading: () => <div className="p-4 text-gray-500">에디터 로딩 중...</div>,
});

export default TiptapEditor;
