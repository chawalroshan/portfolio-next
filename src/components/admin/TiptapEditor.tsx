'use client';

import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useRef, useState } from 'react';
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Link as LinkIcon, Unlink, ImageIcon, Undo, Redo, Loader2,
} from 'lucide-react';
import { label as labelStyle, mutedText } from './styles';

/**
 * Tiptap rich-text editor. Emits HTML (via onChange) which is stored verbatim
 * in Blog.content and rendered with dangerouslySetInnerHTML on the public post
 * page. Images are uploaded to Vercel Blob through /api/upload and inserted as
 * <img> nodes. immediatelyRender:false avoids an SSR hydration mismatch in the
 * App Router.
 */
export default function TiptapEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      Image.configure({ HTMLAttributes: { style: 'max-width:100%;height:auto;border-radius:0.5rem;' } }),
      Placeholder.configure({ placeholder: 'Write your post…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        style: 'min-height:320px;padding:1rem;outline:none;line-height:1.7;',
      },
    },
  });

  async function uploadImage(file: File) {
    setUploading(true);
    try {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body });
      const data = (await res.json()) as { url?: string };
      if (data.url && editor) editor.chain().focus().setImage({ src: data.url }).run();
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  function setLink() {
    if (!editor) return;
    const prev = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', prev ?? 'https://');
    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ border: '1px solid var(--border)', borderRadius: '0.7rem', background: 'var(--input-bg)', overflow: 'hidden' }}>
        <Toolbar
          editor={editor}
          uploading={uploading}
          onPickImage={() => fileRef.current?.click()}
          onSetLink={setLink}
        />
        <div style={{ borderTop: '1px solid var(--border)', color: 'var(--text-primary)' }}>
          <EditorContent editor={editor} />
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void uploadImage(f);
        }}
        style={{ display: 'none' }}
      />
      <p style={{ ...mutedText, marginTop: '0.4rem' }}>Formatting is saved as HTML.</p>
    </div>
  );
}

function Toolbar({
  editor,
  uploading,
  onPickImage,
  onSetLink,
}: {
  editor: Editor | null;
  uploading: boolean;
  onPickImage: () => void;
  onSetLink: () => void;
}) {
  if (!editor) return <div style={{ height: '44px' }} />;

  const Btn = ({
    onClick,
    active,
    disabled,
    title,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '32px',
        height: '32px',
        borderRadius: '0.4rem',
        border: 'none',
        background: active ? 'var(--accent)' : 'transparent',
        color: active ? '#fff' : 'var(--text-muted)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.15rem', padding: '0.4rem' }}>
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline code"><Code size={16} /></Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list"><List size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list"><ListOrdered size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Quote"><Quote size={16} /></Btn>
      <Divider />
      <Btn onClick={onSetLink} active={editor.isActive('link')} title="Add link"><LinkIcon size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove link"><Unlink size={16} /></Btn>
      <Btn onClick={onPickImage} disabled={uploading} title="Insert image">
        {uploading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <ImageIcon size={16} />}
      </Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo"><Undo size={16} /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo"><Redo size={16} /></Btn>
    </div>
  );
}

function Divider() {
  return <span style={{ width: '1px', alignSelf: 'stretch', margin: '0.2rem 0.25rem', background: 'var(--border)' }} />;
}
