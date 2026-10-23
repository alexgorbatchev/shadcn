import { EditorContent, useEditorState, type Editor } from "@tiptap/react";
import { BoldIcon, ItalicIcon, ListIcon, ListOrderedIcon, RedoIcon, UndoIcon } from "lucide-react";
import type { ReactElement } from "react";
import type { IDensityProps } from "../../density/types.js";
import { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator } from "../Toolbar.js";

type RichTextEditorProps = IDensityProps & {
  editor: Editor | null;
  label: string;
};
/** The caller owns a native Tiptap editor and its extensions, content, and persistence. */
function RichTextEditor({ editor, label, density }: RichTextEditorProps): ReactElement {
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
      undo: current?.can().undo() ?? false,
      redo: current?.can().redo() ?? false,
      editable: current?.isEditable ?? false,
    }),
  });
  return (
    <div data-density={density} data-scroll="none" className="min-w-0 rounded-sm border border-input bg-background">
      <Toolbar aria-label={`${label} formatting`} className="rounded-b-none border-0 border-b border-border">
        <ToolbarGroup>
          <ToolbarButton
            aria-label="Bold"
            aria-pressed={state?.bold}
            disabled={!state?.editable}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <BoldIcon />
          </ToolbarButton>
          <ToolbarButton
            aria-label="Italic"
            aria-pressed={state?.italic}
            disabled={!state?.editable}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <ItalicIcon />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarButton
            aria-label="Bullet list"
            aria-pressed={state?.bulletList}
            disabled={!state?.editable}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <ListIcon />
          </ToolbarButton>
          <ToolbarButton
            aria-label="Numbered list"
            aria-pressed={state?.orderedList}
            disabled={!state?.editable}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrderedIcon />
          </ToolbarButton>
        </ToolbarGroup>
        <ToolbarSeparator />
        <ToolbarGroup>
          <ToolbarButton
            aria-label="Undo"
            disabled={!state?.editable || !state.undo}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            <UndoIcon />
          </ToolbarButton>
          <ToolbarButton
            aria-label="Redo"
            disabled={!state?.editable || !state.redo}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            <RedoIcon />
          </ToolbarButton>
        </ToolbarGroup>
      </Toolbar>
      <EditorContent
        editor={editor}
        aria-label={label}
        className="max-h-96 overflow-auto p-3 [&_.tiptap]:min-h-32 [&_.tiptap]:outline-none [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3"
      />
    </div>
  );
}
export { RichTextEditor };
export type { RichTextEditorProps };
export { useEditor, useEditorState, EditorContent } from "@tiptap/react";
export type { Editor, JSONContent, Content, Extensions } from "@tiptap/core";
export { default as StarterKit } from "@tiptap/starter-kit";
