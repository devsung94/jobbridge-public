// components/tiptap/TiptapEditor.tsx
"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

type Props = {
  content: string;
  onChange: (value: string) => void;
};

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editorProps: {
      attributes: {
        class:
          // "w-full text-sm text-gray-900 p-4 min-h-[200px] leading-relaxed bg-white outline-none",
          "w-full min-h-[300px] border border-gray-300 rounded-md p-4 bg-white text-sm text-gray-800 focus:outline-none prose max-w-full",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    immediatelyRender: false, 
  });

  useEffect(() => {
    if (editor && content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [editor]);

  if (!editor) return <div className="p-4 text-gray-500">에디터 불러오는 중...</div>;

  return <EditorContent editor={editor} />;
}
