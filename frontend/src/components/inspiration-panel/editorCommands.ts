import type { RefObject } from "react";

interface EditorCommandDeps {
  editorRef: RefObject<HTMLDivElement | null>;
  ensureAnchorAttributes: () => void;
  onInput: () => void;
}

interface EditorCommands {
  handleCommand: (command: string, value?: string) => void;
  handleCreateLink: () => void;
  handleUndo: () => void;
  handleRedo: () => void;
}

export const createEditorCommands = ({
  editorRef,
  ensureAnchorAttributes,
  onInput,
}: EditorCommandDeps): EditorCommands => {
  const handleCommand = (command: string, value?: string) => {
    const editor = editorRef.current;
    if (!editor) {
      return;
    }

    editor.focus();
    document.execCommand(command, false, value ?? "");
    ensureAnchorAttributes();
    onInput();
  };

  const handleCreateLink = () => {
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    const suggestedValue =
      selectedText && /^https?:\/\//i.test(selectedText)
        ? selectedText
        : "https://";

    const urlInput = window.prompt("Enter URL", suggestedValue);
    if (!urlInput) {
      return;
    }

    const normalizedUrl =
      urlInput.startsWith("http://") || urlInput.startsWith("https://")
        ? urlInput
        : `https://${urlInput}`;

    if (!selectedText) {
      const linkLabel = window.prompt("Link text", normalizedUrl);
      if (!linkLabel) {
        return;
      }
      handleCommand(
        "insertHTML",
        `<a href="${normalizedUrl}" target="_blank" rel="noopener noreferrer">${linkLabel}</a>`
      );
      return;
    }

    handleCommand("createLink", normalizedUrl);
  };

  const handleUndo = () => {
    document.execCommand("undo");
    onInput();
  };

  const handleRedo = () => {
    document.execCommand("redo");
    onInput();
  };

  return {
    handleCommand,
    handleCreateLink,
    handleUndo,
    handleRedo,
  };
};
