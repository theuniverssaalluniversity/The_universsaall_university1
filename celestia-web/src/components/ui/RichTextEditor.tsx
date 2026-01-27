import { useEffect, useRef, useState } from 'react';
import { Bold, Italic, List, ListOrdered, Heading, Undo, Code, GripHorizontal } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (html: string) => void;
    placeholder?: string;
    className?: string;
}

export const RichTextEditor = ({ value, onChange, placeholder, className }: RichTextEditorProps) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    // Initial value synchronization
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update if content is meaningfully different to avoid cursor jumps
            // Simple check: if empty and value provided
            if (!editorRef.current.innerHTML || value === '' || value !== editorRef.current.innerHTML) {
                // Cursor management is tricky with contentEditable. 
                // We only set innerHTML if specific conditions met to avoid loop.
                // For now: only sync if not focused or specialized.
                if (!isFocused) {
                    editorRef.current.innerHTML = value;
                }
            }
        }
    }, [value, isFocused]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    return (
        <div className={`border rounded-xl overflow-hidden bg-black/50 flex flex-col ${isFocused ? 'border-primary/50 ring-1 ring-primary/20' : 'border-white/10'} ${className}`}>
            {/* Toolbar */}
            <div className="flex gap-1 p-2 border-b border-white/5 bg-zinc-900/50 flex-wrap">
                <ToolbarBtn icon={Bold} onClick={() => execCommand('bold')} label="Bold" />
                <ToolbarBtn icon={Italic} onClick={() => execCommand('italic')} label="Italic" />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolbarBtn icon={Heading} onClick={() => execCommand('formatBlock', '<h2>')} label="Heading" />
                <ToolbarBtn icon={Code} onClick={() => execCommand('formatBlock', '<pre>')} label="Code" />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolbarBtn icon={List} onClick={() => execCommand('insertUnorderedList')} label="Bullet List" />
                <ToolbarBtn icon={ListOrdered} onClick={() => execCommand('insertOrderedList')} label="Numbered List" />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolbarBtn icon={GripHorizontal} onClick={() => execCommand('insertHorizontalRule')} label="Divider" />
                <div className="w-px h-6 bg-white/10 mx-1" />
                <ToolbarBtn icon={Undo} onClick={() => execCommand('undo')} label="Undo" />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                className="flex-1 p-4 min-h-[200px] outline-none prose prose-invert max-w-none text-sm"
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                data-placeholder={placeholder}
                style={{ overflowY: 'auto' }}
            />
            <style>{`
                [contentEditable]:empty:before {
                    content: attr(data-placeholder);
                    color: #52525b;
                    cursor: text;
                }
            `}</style>
        </div>
    );
};

const ToolbarBtn = ({ icon: Icon, onClick, label }: { icon: any, onClick: () => void, label: string }) => (
    <button
        type="button"
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded transition-colors"
        title={label}
    >
        <Icon size={16} />
    </button>
);
