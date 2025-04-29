"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Link from '@tiptap/extension-link';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import CodeBlock from '@tiptap/extension-code-block';
import Blockquote from '@tiptap/extension-blockquote';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import { ResizableImage } from "./extensions/ResizableImage";
import TextStyle from "./extensions/TextStyle";
import Color from "@tiptap/extension-color";
import { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import clsx from "clsx";

type Props = {
  content: string;
  onChange: (value: string) => void;
};

function rgbToHex(rgb: string): string {
  const result = rgb.match(/\d+/g);
  if (!result) return "#000000";
  return (
    "#" +
    result
      .slice(0, 3)
      .map((x) => {
        const hex = parseInt(x).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

function ToolbarButton({ onClick, children, title, isActive }: { onClick: () => void; children: React.ReactNode; title: string; isActive?: boolean }) {
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={onClick}
            className={clsx(
              "px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white",
              isActive && "bg-gray-300 dark:bg-gray-600"
            )}
          >
            {children}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content
          className="px-2 py-1 text-xs bg-black text-white rounded shadow"
          side="top"
          sideOffset={5}
        >
          {title}
        </Tooltip.Content>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}

export default function TiptapEditorWithToolbar({ content, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [paragraphLevel, setParagraphLevel] = useState("0");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        strike: false,
        heading: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      TextStyle,
      Color.configure({ types: ['textStyle'] }),
      ResizableImage,
      Underline,
      Strike,
      Link.configure({ openOnClick: true }),
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      BulletList,
      OrderedList,
      ListItem,
      CodeBlock,
      Blockquote,
      HorizontalRule,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      TextAlign.configure({ types: ['heading', 'paragraph', 'resizableImage'] }),
    ],
    content: content,
    autofocus: false,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-[300px] p-4 bg-white dark:bg-zinc-900 text-sm text-gray-900 dark:text-white",
      },
      handleDrop(view, event, _slice, moved) {
        if (!moved && event.dataTransfer?.files?.length) {
          const file = event.dataTransfer.files[0];
          const reader = new FileReader();

          reader.onload = () => {
            const base64 = reader.result as string;
            const { schema } = view.state;
            const resizableImageNode = schema.nodes.resizableImage?.create({
              src: base64,
              width: "300px",
              height: "auto",
              textAlign: "center",
            });
            if (resizableImageNode) {
              const transaction = view.state.tr.replaceSelectionWith(resizableImageNode);
              view.dispatch(transaction);
            }
          };

          reader.readAsDataURL(file);
          return true;
        }
        return false;
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
    
    const updateStyle = () => {
      const { fontSize, color } = editor.getAttributes("textStyle");
      const { level } = editor.getAttributes("heading");

      setFontSize(fontSize || "");
      setTextColor(color?.startsWith("rgb") ? rgbToHex(color) : color || "#000000");
      setParagraphLevel(level ? level.toString() : "0");
    };

    editor.on("selectionUpdate", updateStyle);
    editor.on("transaction", updateStyle);

    return () => {
      editor.off("selectionUpdate", updateStyle);
      editor.off("transaction", updateStyle);
    };
  }, [editor, content]);

  const addImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result;
      editor?.chain().focus().insertContent({
        type: "resizableImage",
        attrs: {
          src: base64,
          width: "300px",
          height: "auto",
          textAlign: "center",
        },
      }).run();
    };
    reader.readAsDataURL(file);
  };

  const isActive = (name: string, attrs?: Record<string, any>) => editor?.isActive(name, attrs);

  if (!editor) return <div className="p-4 text-gray-500">에디터 로딩 중...</div>;

  return (
    <div className="border rounded-md shadow-sm">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-gray-50 dark:bg-zinc-800 rounded-t-md text-gray-700 dark:text-gray-100 text-sm">
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="되돌리기">↺</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="다시 실행">↻</ToolbarButton>
         
        <select
          value={paragraphLevel}
          onChange={(e) => {
            const val = e.target.value;
            setParagraphLevel(val);

            // 제목 선택 시 폰트 스타일 제거
            setFontSize("");
            editor?.chain().focus().unsetMark("textStyle").run();

            if (val === "0") {
              editor?.chain().focus().setParagraph().run();
            } else {
              editor?.chain().focus().toggleHeading({ level: parseInt(val) as 1 | 2 | 3 | 4 | 5 | 6 }).run();
            }
          }}
          className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-600"
        >
          <option value="0">본문</option>
          {[1, 2, 3, 4, 5, 6].map((level) => (
            <option key={level} value={level}>{`제목 ${level}`}</option>
          ))}
        </select>


        <div className="flex items-center gap-2">
          <select
            value={fontSize}
            onChange={(e) => {
              const value = e.target.value;

              // 폰트크기 바꾸면 heading은 초기화
              setParagraphLevel("0");
              editor?.chain().focus().setParagraph().setMark("textStyle", { fontSize: value }).run();
              setFontSize(value);
            }}
            className="px-2 py-1 border rounded dark:bg-zinc-900 dark:border-zinc-600"
          >
            <option value="">폰트 크기</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
          </select>

          <input
            type="color"
            value={textColor}
            onChange={(e) => {
              const value = e.target.value;
              editor?.chain().focus().setColor(value).run();
              setTextColor(value);
            }}
            className="w-8 h-8 p-0 border rounded cursor-pointer"
          />
        </div>

        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} title="굵게" isActive={isActive('bold')}>B</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} title="기울임" isActive={isActive('italic')}>I</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} title="밑줄" isActive={isActive('underline')}>U</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} title="취소선" isActive={isActive('strike')}>S</ToolbarButton>
        <ToolbarButton
          onClick={() => {
            const url = window.prompt("링크 주소 입력");
            if (url) editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
          }}
          title="링크 추가"
          isActive={isActive('link')}
        >🔗</ToolbarButton>

        <ToolbarButton onClick={() => fileInputRef.current?.click()} title="이미지 업로드">🖼️</ToolbarButton>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && addImage(e.target.files[0])}
          className="hidden"
        />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} title="인용문" isActive={isActive('blockquote')}>❝</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} title="리스트" isActive={isActive('bulletList')}>•</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} title="번호 리스트" isActive={isActive('orderedList')}>1.</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="구분선">―</ToolbarButton>

        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("left").run()} title="왼쪽 정렬" isActive={isActive('textAlign', { textAlign: 'left' })}>⇤</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("center").run()} title="가운데 정렬" isActive={isActive('textAlign', { textAlign: 'center' })}>↔</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setTextAlign("right").run()} title="오른쪽 정렬" isActive={isActive('textAlign', { textAlign: 'right' })}>⇥</ToolbarButton>
      </div>

      <EditorContent editor={editor} className="min-h-[300px] px-4 py-3 text-sm focus:outline-none bg-white dark:bg-zinc-900" />
    </div>
  );
}
