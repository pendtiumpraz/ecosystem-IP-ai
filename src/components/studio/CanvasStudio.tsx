'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    FileText,
    Link2,
    ListTodo,
    Columns,
    MessageCircle,
    MoreHorizontal,
    Image as ImageIcon,
    Upload,
    Pencil,
    Plus,
    ZoomIn,
    ZoomOut,
    Trash2,
    Move,
    Edit3,
    Save,
    X,
    Check,
    ChevronDown,
    Download,
    Share2,
    Users,
    Palette,
    Eye,
    Grid3X3,
    Layers,
    MousePointer2,
    PenTool,
    Eraser,
    Square,
    Circle,
    Type,
    Undo,
    Redo,
    Settings,
    Home,
    Folder,
    ChevronRight,
    LayoutGrid,
    Search,
    Clock,
    Star,
    Heart,
    Pin,
    Video,
    Music,
    Quote,
    StickyNote,
    ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/lib/sweetalert';

// ============ TYPES ============
type CanvasMode = 'select' | 'draw' | 'erase' | 'text' | 'shape';
type ElementType = 'note' | 'image' | 'board' | 'link' | 'todo' | 'column' | 'color' | 'video' | 'file' | 'comment';
type ShapeType = 'rectangle' | 'circle' | 'arrow' | 'line';

interface Position {
    x: number;
    y: number;
}

interface CanvasElement {
    id: string;
    type: ElementType;
    position: Position;
    size: { width: number; height: number };
    content: any;
    zIndex: number;
    isLocked?: boolean;
    connections?: string[]; // IDs of connected elements
}

interface DrawPath {
    id: string;
    points: Position[];
    color: string;
    strokeWidth: number;
}

interface Comment {
    id: string;
    user: {
        name: string;
        avatar: string;
        color: string;
    };
    text: string;
    timestamp: Date;
    position: Position;
    replies?: Comment[];
}

interface CanvasStudioProps {
    projectId: string;
    userId: string;
    canvasType: 'character' | 'universe' | 'story' | 'project' | 'moodboard';
    canvasName?: string;
    onSave?: (data: any) => void;
}

// ============ TOOL BUTTON COMPONENT ============
const ToolButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick?: () => void;
    shortcut?: string;
}> = ({ icon, label, active = false, onClick, shortcut }) => (
    <button
        onClick={onClick}
        className={`relative group flex flex-col items-center justify-center p-2.5 rounded-lg transition-all duration-200
      ${active
                ? 'bg-coral-500 text-white shadow-md shadow-coral-500/30'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
        title={`${label}${shortcut ? ` (${shortcut})` : ''}`}
    >
        {icon}
        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
            {label}
            {shortcut && <span className="ml-2 text-gray-400">{shortcut}</span>}
        </div>
    </button>
);

// ============ CANVAS CARD COMPONENT ============
const CanvasCard: React.FC<{
    element: CanvasElement;
    isSelected: boolean;
    onSelect: () => void;
    onDrag: (position: Position) => void;
    onResize: (size: { width: number; height: number }) => void;
    onDelete: () => void;
    onEdit: (content: any) => void;
}> = ({ element, isSelected, onSelect, onDrag, onDelete, onEdit }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        e.stopPropagation();
        onSelect();

        const startX = e.clientX - element.position.x;
        const startY = e.clientY - element.position.y;

        const handleMouseMove = (e: MouseEvent) => {
            setIsDragging(true);
            onDrag({
                x: e.clientX - startX,
                y: e.clientY - startY,
            });
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const renderContent = () => {
        switch (element.type) {
            case 'note':
                return (
                    <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{element.content.title}</h4>
                        <p className="text-sm text-gray-600 leading-relaxed">{element.content.text}</p>
                    </div>
                );

            case 'image':
                return (
                    <div className="relative group/image">
                        <img
                            src={element.content.url}
                            alt={element.content.alt || ''}
                            className="w-full h-full object-cover rounded-lg"
                        />
                        {element.content.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                                <p className="text-white text-sm">{element.content.caption}</p>
                            </div>
                        )}
                    </div>
                );

            case 'board':
                return (
                    <div className="p-4 bg-gradient-to-br from-white to-gray-50">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${element.content.color || 'bg-coral-500'}`}>
                                <LayoutGrid className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-900">{element.content.title}</h4>
                                <p className="text-xs text-gray-500">{element.content.cardCount || 0} cards</p>
                            </div>
                        </div>
                        {element.content.preview && (
                            <div className="grid grid-cols-2 gap-2 mt-3">
                                {element.content.preview.slice(0, 4).map((item: string, i: number) => (
                                    <div key={i} className="w-full h-12 bg-gray-100 rounded-lg" />
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'todo':
                return (
                    <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <ListTodo className="w-4 h-4 text-coral-500" />
                            {element.content.title || 'Things to do'}
                        </h4>
                        <div className="space-y-2">
                            {element.content.items?.map((item: { text: string; done: boolean }, i: number) => (
                                <label key={i} className="flex items-center gap-2 cursor-pointer group/item">
                                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                    ${item.done ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 group-hover/item:border-coral-400'}`}>
                                        {item.done && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <span className={`text-sm ${item.done ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                        {item.text}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                );

            case 'color':
                return (
                    <div className="p-3">
                        <div
                            className="w-full aspect-square rounded-lg mb-2"
                            style={{ backgroundColor: element.content.color }}
                        />
                        <div className="text-center">
                            <p className="text-xs font-mono text-gray-600 uppercase">{element.content.color}</p>
                            {element.content.name && (
                                <p className="text-sm text-gray-900 mt-1">{element.content.name}</p>
                            )}
                        </div>
                    </div>
                );

            case 'link':
                return (
                    <a
                        href={element.content.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-4 hover:bg-gray-50 transition-colors"
                    >
                        {element.content.thumbnail && (
                            <img
                                src={element.content.thumbnail}
                                alt=""
                                className="w-full h-32 object-cover rounded-lg mb-3"
                            />
                        )}
                        <div className="flex items-center gap-2 mb-2">
                            <Link2 className="w-4 h-4 text-blue-500" />
                            <span className="text-xs text-blue-500 truncate">{element.content.domain}</span>
                        </div>
                        <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">{element.content.title}</h4>
                    </a>
                );

            case 'video':
                return (
                    <div className="relative">
                        <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden">
                            {element.content.thumbnail ? (
                                <img src={element.content.thumbnail} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Video className="w-8 h-8 text-gray-600" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                    <div className="w-0 h-0 border-l-[12px] border-l-gray-900 border-y-[7px] border-y-transparent ml-1" />
                                </div>
                            </div>
                        </div>
                        <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 truncate">{element.content.title}</p>
                            <p className="text-xs text-gray-500">{element.content.duration}</p>
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="p-4 flex items-center justify-center text-gray-400">
                        <FileText className="w-8 h-8" />
                    </div>
                );
        }
    };

    return (
        <div
            ref={cardRef}
            className={`absolute rounded-xl bg-white shadow-lg transition-shadow overflow-hidden
        ${isSelected ? 'ring-2 ring-coral-500 shadow-xl' : 'hover:shadow-xl'}
        ${isDragging ? 'cursor-grabbing opacity-90' : 'cursor-grab'}`}
            style={{
                left: element.position.x,
                top: element.position.y,
                width: element.size.width,
                minHeight: element.size.height,
                zIndex: element.zIndex,
            }}
            onMouseDown={handleMouseDown}
        >
            {/* Card Content */}
            {renderContent()}

            {/* Selection Controls */}
            {isSelected && (
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white rounded-lg shadow-lg px-2 py-1">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-1.5 hover:bg-red-50 rounded-md text-red-500"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-gray-200 mx-1" />
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-600">
                        <MoreHorizontal className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Resize Handle */}
            {isSelected && (
                <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize">
                    <div className="absolute bottom-1 right-1 w-2 h-2 bg-coral-500 rounded-sm" />
                </div>
            )}
        </div>
    );
};

// ============ COMMENT BUBBLE COMPONENT ============
const CommentBubble: React.FC<{
    comment: Comment;
    onReply: (text: string) => void;
}> = ({ comment, onReply }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [replyText, setReplyText] = useState('');

    return (
        <div
            className="absolute"
            style={{ left: comment.position.x, top: comment.position.y }}
        >
            {/* User Indicator */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="relative"
            >
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-md"
                    style={{ backgroundColor: comment.user.color }}
                >
                    {comment.user.name.charAt(0).toUpperCase()}
                </div>
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-coral-500 rounded-full border-2 border-white" />
            </button>

            {/* Expanded Comment */}
            {isExpanded && (
                <div className="absolute left-10 top-0 w-72 bg-white rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="p-4">
                        <div className="flex items-start gap-3">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                                style={{ backgroundColor: comment.user.color }}
                            >
                                {comment.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900">{comment.user.name}</span>
                                    <span className="text-xs text-gray-400">
                                        {new Date(comment.timestamp).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">{comment.text}</p>
                            </div>
                        </div>

                        {/* Reply Input */}
                        <div className="flex items-center gap-2 mt-4">
                            <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Reply..."
                                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20"
                            />
                            <Button
                                size="sm"
                                className="bg-coral-500 text-white hover:bg-coral-600"
                                onClick={() => {
                                    if (replyText) {
                                        onReply(replyText);
                                        setReplyText('');
                                    }
                                }}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ============ MAIN CANVAS STUDIO COMPONENT ============
export function CanvasStudio({
    projectId,
    userId,
    canvasType,
    canvasName = 'Untitled Canvas',
    onSave,
}: CanvasStudioProps) {
    // Canvas State
    const [elements, setElements] = useState<CanvasElement[]>([]);
    const [drawPaths, setDrawPaths] = useState<DrawPath[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [selectedElement, setSelectedElement] = useState<string | null>(null);

    // Tool State
    const [mode, setMode] = useState<CanvasMode>('select');
    const [drawColor, setDrawColor] = useState('#FF5A5F'); // Coral
    const [strokeWidth, setStrokeWidth] = useState(3);

    // Canvas Navigation
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState<Position>({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);

    // UI State
    const [showGrid, setShowGrid] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [unsavedChanges, setUnsavedChanges] = useState(false);

    // Refs
    const canvasRef = useRef<HTMLDivElement>(null);
    const drawCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef(false);
    const currentPath = useRef<Position[]>([]);

    // Color Palette
    const colors = [
        '#FF5A5F', // Coral
        '#F5A623', // Orange
        '#F8E71C', // Yellow
        '#7ED321', // Green
        '#4A90E2', // Blue
        '#BD10E0', // Purple
        '#1A1A1A', // Black
    ];

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case 'v':
                    setMode('select');
                    break;
                case 'p':
                    setMode('draw');
                    break;
                case 'e':
                    setMode('erase');
                    break;
                case 't':
                    setMode('text');
                    break;
                case 'delete':
                case 'backspace':
                    if (selectedElement) {
                        handleDeleteElement(selectedElement);
                    }
                    break;
                case 's':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        handleSave();
                    }
                    break;
                case 'z':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        // Undo logic
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElement]);

    // Drawing Logic
    useEffect(() => {
        const canvas = drawCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and redraw all paths
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawPaths.forEach(path => {
            if (path.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.strokeWidth;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.moveTo(path.points[0].x, path.points[0].y);
            for (let i = 1; i < path.points.length; i++) {
                ctx.lineTo(path.points[i].x, path.points[i].y);
            }
            ctx.stroke();
        });
    }, [drawPaths]);

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (mode === 'select') {
            // Start panning
            if (e.button === 1 || (e.button === 0 && e.altKey)) {
                setIsPanning(true);
                return;
            }
            // Deselect when clicking empty space
            setSelectedElement(null);
        } else if (mode === 'draw') {
            isDrawing.current = true;
            const rect = drawCanvasRef.current?.getBoundingClientRect();
            if (rect) {
                currentPath.current = [{ x: e.clientX - rect.left, y: e.clientY - rect.top }];
            }
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isPanning) {
            setPan(prev => ({
                x: prev.x + e.movementX,
                y: prev.y + e.movementY,
            }));
            return;
        }

        if (mode === 'draw' && isDrawing.current) {
            const rect = drawCanvasRef.current?.getBoundingClientRect();
            if (rect) {
                currentPath.current.push({ x: e.clientX - rect.left, y: e.clientY - rect.top });

                // Live drawing preview
                const ctx = drawCanvasRef.current?.getContext('2d');
                if (ctx && currentPath.current.length >= 2) {
                    const last = currentPath.current[currentPath.current.length - 2];
                    const current = currentPath.current[currentPath.current.length - 1];

                    ctx.beginPath();
                    ctx.strokeStyle = drawColor;
                    ctx.lineWidth = strokeWidth;
                    ctx.lineCap = 'round';
                    ctx.moveTo(last.x, last.y);
                    ctx.lineTo(current.x, current.y);
                    ctx.stroke();
                }
            }
        }
    };

    const handleCanvasMouseUp = () => {
        setIsPanning(false);

        if (mode === 'draw' && isDrawing.current) {
            isDrawing.current = false;
            if (currentPath.current.length > 1) {
                setDrawPaths(prev => [...prev, {
                    id: `path-${Date.now()}`,
                    points: [...currentPath.current],
                    color: drawColor,
                    strokeWidth,
                }]);
                setUnsavedChanges(true);
            }
            currentPath.current = [];
        }
    };

    const handleAddElement = (type: ElementType) => {
        const newElement: CanvasElement = {
            id: `element-${Date.now()}`,
            type,
            position: { x: 200 + Math.random() * 200, y: 200 + Math.random() * 200 },
            size: getDefaultSize(type),
            content: getDefaultContent(type),
            zIndex: elements.length + 1,
        };

        setElements(prev => [...prev, newElement]);
        setSelectedElement(newElement.id);
        setUnsavedChanges(true);
    };

    const getDefaultSize = (type: ElementType) => {
        switch (type) {
            case 'note': return { width: 280, height: 150 };
            case 'image': return { width: 300, height: 200 };
            case 'board': return { width: 250, height: 180 };
            case 'todo': return { width: 220, height: 180 };
            case 'color': return { width: 120, height: 140 };
            case 'link': return { width: 260, height: 200 };
            case 'video': return { width: 320, height: 240 };
            default: return { width: 200, height: 150 };
        }
    };

    const getDefaultContent = (type: ElementType) => {
        switch (type) {
            case 'note': return { title: 'New Note', text: 'Click to edit...' };
            case 'image': return { url: '/api/placeholder/300/200', alt: 'Placeholder' };
            case 'board': return { title: 'New Board', cardCount: 0, color: 'bg-coral-500' };
            case 'todo': return { title: 'To-do List', items: [{ text: 'First task', done: false }] };
            case 'color': return { color: '#FF5A5F', name: 'Coral' };
            case 'link': return { url: 'https://example.com', title: 'Link', domain: 'example.com' };
            case 'video': return { title: 'Video', duration: '0:00' };
            default: return {};
        }
    };

    const handleDeleteElement = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        setSelectedElement(null);
        setUnsavedChanges(true);
    };

    const handleUpdateElementPosition = (id: string, position: Position) => {
        setElements(prev => prev.map(el =>
            el.id === id ? { ...el, position } : el
        ));
        setUnsavedChanges(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Simulate save
            await new Promise(resolve => setTimeout(resolve, 1000));
            onSave?.({ elements, drawPaths, comments });
            setUnsavedChanges(false);
            toast.success('Canvas saved successfully!');
        } catch (error) {
            toast.error('Failed to save canvas');
        } finally {
            setIsSaving(false);
        }
    };

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.max(0.25, Math.min(2, prev + delta)));
    };

    // Canvas Type Config
    const canvasConfig = {
        character: {
            title: 'Character Canvas',
            icon: <Users className="w-5 h-5" />,
            color: 'bg-purple-500',
            description: 'Build your character moodboard',
        },
        universe: {
            title: 'Universe Canvas',
            icon: <Layers className="w-5 h-5" />,
            color: 'bg-blue-500',
            description: 'Define your world',
        },
        story: {
            title: 'Story Canvas',
            icon: <FileText className="w-5 h-5" />,
            color: 'bg-emerald-500',
            description: 'Plot your narrative',
        },
        project: {
            title: 'Project Canvas',
            icon: <Folder className="w-5 h-5" />,
            color: 'bg-amber-500',
            description: 'Manage your project',
        },
        moodboard: {
            title: 'Moodboard',
            icon: <ImageIcon className="w-5 h-5" />,
            color: 'bg-coral-500',
            description: 'Collect inspiration',
        },
    };

    const config = canvasConfig[canvasType];

    return (
        <div className="h-screen flex bg-[#F7F7F7] overflow-hidden">
            {/* Left Toolbar */}
            <aside className="w-14 bg-white border-r border-gray-200 flex flex-col items-center py-4 gap-1">
                <ToolButton
                    icon={<MousePointer2 className="w-5 h-5" />}
                    label="Select"
                    shortcut="V"
                    active={mode === 'select'}
                    onClick={() => setMode('select')}
                />
                <ToolButton
                    icon={<PenTool className="w-5 h-5" />}
                    label="Draw"
                    shortcut="P"
                    active={mode === 'draw'}
                    onClick={() => setMode('draw')}
                />
                <ToolButton
                    icon={<Eraser className="w-5 h-5" />}
                    label="Erase"
                    shortcut="E"
                    active={mode === 'erase'}
                    onClick={() => setMode('erase')}
                />

                <div className="w-8 h-px bg-gray-200 my-2" />

                <ToolButton
                    icon={<StickyNote className="w-5 h-5" />}
                    label="Note"
                    onClick={() => handleAddElement('note')}
                />
                <ToolButton
                    icon={<ImageIcon className="w-5 h-5" />}
                    label="Image"
                    onClick={() => handleAddElement('image')}
                />
                <ToolButton
                    icon={<LayoutGrid className="w-5 h-5" />}
                    label="Board"
                    onClick={() => handleAddElement('board')}
                />
                <ToolButton
                    icon={<ListTodo className="w-5 h-5" />}
                    label="To-do"
                    onClick={() => handleAddElement('todo')}
                />
                <ToolButton
                    icon={<Link2 className="w-5 h-5" />}
                    label="Link"
                    onClick={() => handleAddElement('link')}
                />
                <ToolButton
                    icon={<Palette className="w-5 h-5" />}
                    label="Color"
                    onClick={() => handleAddElement('color')}
                />
                <ToolButton
                    icon={<Video className="w-5 h-5" />}
                    label="Video"
                    onClick={() => handleAddElement('video')}
                />

                <div className="flex-1" />

                <ToolButton
                    icon={<Upload className="w-5 h-5" />}
                    label="Upload"
                    onClick={() => toast.info('Upload coming soon!')}
                />
                <ToolButton
                    icon={<Pencil className="w-5 h-5" />}
                    label="Draw Mode"
                    onClick={() => setMode('draw')}
                />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                            <Home className="w-5 h-5 text-gray-500" />
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg">
                            <Folder className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Work</span>
                        </button>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                            <div className={`w-5 h-5 rounded flex items-center justify-center text-white ${config.color}`}>
                                {config.icon}
                            </div>
                            <span className="text-sm font-medium text-gray-900">{canvasName}</span>
                        </button>
                    </div>

                    {/* Center Title */}
                    <h1 className="text-lg font-semibold text-gray-900">{config.title}</h1>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-coral-500 flex items-center justify-center text-white text-sm font-bold">
                                U
                            </div>
                        </div>

                        <Button variant="outline" size="sm" className="gap-2">
                            <Users className="w-4 h-4" />
                            Editors
                            <ChevronDown className="w-3 h-3" />
                        </Button>

                        <Button variant="outline" size="sm" className="gap-2">
                            <Share2 className="w-4 h-4" />
                            Publish & share
                        </Button>

                        <Button variant="outline" size="sm" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>

                        {/* Save Status */}
                        {unsavedChanges && (
                            <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200">
                                Unsaved
                            </Badge>
                        )}

                        {isSaving && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                                Saving...
                            </Badge>
                        )}

                        <Button
                            size="sm"
                            className="bg-coral-500 text-white hover:bg-coral-600"
                            onClick={handleSave}
                            disabled={isSaving || !unsavedChanges}
                        >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                        </Button>
                    </div>
                </header>

                {/* Canvas Area */}
                <div
                    ref={canvasRef}
                    className="flex-1 relative overflow-hidden cursor-default"
                    onMouseDown={handleCanvasMouseDown}
                    onMouseMove={handleCanvasMouseMove}
                    onMouseUp={handleCanvasMouseUp}
                    onMouseLeave={handleCanvasMouseUp}
                    style={{
                        backgroundImage: showGrid
                            ? 'radial-gradient(circle, #ddd 1px, transparent 1px)'
                            : 'none',
                        backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
                        backgroundPosition: `${pan.x}px ${pan.y}px`,
                    }}
                >
                    {/* Drawing Canvas Layer */}
                    <canvas
                        ref={drawCanvasRef}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                        }}
                        width={3000}
                        height={2000}
                    />

                    {/* Elements Layer */}
                    <div
                        className="absolute inset-0"
                        style={{
                            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                            transformOrigin: '0 0',
                        }}
                    >
                        {elements.map(element => (
                            <CanvasCard
                                key={element.id}
                                element={element}
                                isSelected={selectedElement === element.id}
                                onSelect={() => setSelectedElement(element.id)}
                                onDrag={(pos) => handleUpdateElementPosition(element.id, pos)}
                                onResize={() => { }}
                                onDelete={() => handleDeleteElement(element.id)}
                                onEdit={() => { }}
                            />
                        ))}

                        {/* Comments */}
                        {comments.map(comment => (
                            <CommentBubble
                                key={comment.id}
                                comment={comment}
                                onReply={(text) => {
                                    // Handle reply
                                    console.log('Reply:', text);
                                }}
                            />
                        ))}
                    </div>

                    {/* Zoom Controls */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white rounded-lg shadow-lg px-2 py-1">
                        <button
                            onClick={() => handleZoom(-0.1)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                            <ZoomOut className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-medium text-gray-600 min-w-[60px] text-center">
                            {Math.round(zoom * 100)}%
                        </span>
                        <button
                            onClick={() => handleZoom(0.1)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
                        >
                            <ZoomIn className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Undo/Redo */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-white rounded-lg shadow-lg px-1 py-1">
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30">
                            <Undo className="w-4 h-4" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 disabled:opacity-30">
                            <Redo className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Drawing Tools (when in draw mode) */}
                {mode === 'draw' && (
                    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white rounded-2xl shadow-xl px-6 py-3">
                        {/* Color Picker */}
                        <div className="flex items-center gap-2">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setDrawColor(color)}
                                    className={`w-8 h-8 rounded-full transition-transform ${drawColor === color ? 'scale-110 ring-2 ring-offset-2 ring-gray-400' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>

                        <div className="w-px h-8 bg-gray-200" />

                        {/* Stroke Width */}
                        <div className="flex items-center gap-2">
                            {[2, 4, 8].map(width => (
                                <button
                                    key={width}
                                    onClick={() => setStrokeWidth(width)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${strokeWidth === width ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                >
                                    <div
                                        className="rounded-full bg-gray-800"
                                        style={{ width: width * 2, height: width * 2 }}
                                    />
                                </button>
                            ))}
                        </div>

                        <div className="w-px h-8 bg-gray-200" />

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setDrawPaths([]);
                                setUnsavedChanges(true);
                            }}
                        >
                            Discard
                        </Button>

                        <Button
                            size="sm"
                            className="bg-coral-500 text-white hover:bg-coral-600"
                            onClick={handleSave}
                        >
                            Save
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CanvasStudio;
