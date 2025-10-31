"use client";

import type { NextPage } from 'next';
import { 
    ChevronLeft, Plus, X, Library, Settings, Zap, Repeat, Users, Clock, Upload, 
    Link as LinkIcon, Shield, Bot, FileJson, Copy, Eye, Search, ChevronsUpDown,
    Check, ArrowRight, Twitter, BookOpen, Video, Mic, MessageSquare, UserPlus, BarChart, FileText
} from 'lucide-react';
import React, { FC, ReactNode, useState, ChangeEvent, useMemo, useEffect } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

//- ============================================================================
//- TYPE DEFINITIONS
//- ============================================================================

type TaskTemplate = {
    name: string;
    category: string;
    verification: string;
    icon: React.ElementType;
};

type Task = {
    id: string;
    name: string;
    description: string;
    xp: number;
    status: 'Active' | 'Draft';
};

//- ============================================================================
//- MOCK DATA & CONFIG
//- ============================================================================

const TASK_LIBRARY_TEMPLATES: TaskTemplate[] = [
    { name: 'Like Post', category: 'Social Engagement', verification: 'API/Manual', icon: Twitter },
    { name: 'Retweet', category: 'Social Amplification', verification: 'API/Manual', icon: Repeat },
    { name: 'Quote Retweet with Insight', category: 'Content Creation', verification: 'AI/Manual', icon: BookOpen },
    { name: 'Comment on Post', category: 'Community Engagement', verification: 'API/Manual', icon: MessageSquare },
    { name: 'Original Tweet/Thread', category: 'Content Creation', verification: 'AI/Manual', icon: Twitter },
    { name: 'Short Video (<60s)', category: 'Video Content', verification: 'AI/Manual', icon: Video },
    { name: 'Join AMA', category: 'Event Participation', verification: 'Manual', icon: Mic },
    { name: 'Ask Question in AMA', category: 'Event Engagement', verification: 'Manual', icon: Mic },
    { name: 'Survey/Feedback', category: 'Data Collection', verification: 'Form', icon: FileText },
    { name: 'Discord/Telegram Message', category: 'Community Building', verification: 'Bot/Manual', icon: MessageSquare },
    { name: 'Invite Verified Ambassador', category: 'Network Growth', verification: 'API', icon: UserPlus },
    { name: '500+ Tweet Views', category: 'Performance Milestone', verification: 'API', icon: BarChart },
    { name: 'Write Blog/Article', category: 'Long-form Content', verification: 'AI/Manual', icon: FileText },
];

const initialTasks: Task[] = [
    { id: '1', name: 'Retweet Cubane Content', description: 'Amplify our latest announcement.', xp: 10, status: 'Active' },
    { id: '2', name: 'Write Blog/Article', description: 'Create long-form content about our ecosystem.', xp: 100, status: 'Active' },
    { id: '3', name: 'Host/Attend Local Meetup', description: 'Engage with the community in person.', xp: 50, status: 'Draft' },
];

const XP_OPTIONS = [1, 5, 10, 50, 100];


//- ============================================================================
//- REUSABLE UI COMPONENTS
//- ============================================================================

const Header: FC = () => (
    <header className="flex items-center justify-between w-full py-3 px-8 border-b border-gray-800 bg-black/50 sticky top-0 backdrop-blur-sm z-50">
      <h1 className="text-lg font-semibold text-gray-300">Admin Panel</h1>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-gray-600">G</div>
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold text-white cursor-pointer hover:bg-gray-600">M</div>
      </div>
    </header>
);

const Modal: FC<{ isOpen: boolean; onClose: () => void; children: ReactNode; className?: string }> = ({ isOpen, onClose, children, className = '' }) => {
    if (!isOpen) return null;
    return (
        <div 
            className="fixed inset-0 flex items-center justify-center z-[100]" 
            style={{ backgroundColor: 'var(--color-black)' + '80' }}
            onClick={onClose}
        >
            <div 
                className={`rounded-xl shadow-lg relative max-h-[90vh] overflow-y-auto ${className}`}
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                }}
                onClick={e => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 hover:opacity-70"
                    style={{ 
                        color: 'var(--text-tertiary)'
                    }}
                >
                    <X />
                </button>
                {children}
            </div>
        </div>
    );
};

function Input({ className, ...props }: InputProps) {
    return (
        <input 
            className={`input ${className}`}
            {...props} 
        />
    );
}

function Textarea({ className, ...props }: TextareaProps) {
    return (
        <textarea 
            className={`input min-h-[100px] ${className}`}
            {...props} 
        />
    );
}

const ToggleSwitch: FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
        <span className="text-sm text-gray-300">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-10 h-6 rounded-full transition ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
    </label>
);

//- ============================================================================
//- TASK MANAGEMENT SUB-COMPONENTS
//- ============================================================================

const TaskCard: FC<{ task: Task; onEdit: (task: Task) => void }> = ({ task, onEdit }) => (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center hover:bg-gray-800 transition-colors">
        <div>
            <h3 className="font-semibold text-white">{task.name}</h3>
            <p className="text-sm text-gray-400">{task.description}</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="text-right">
                <p className="font-bold text-lg text-yellow-400">{task.xp} XP</p>
                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${task.status === 'Active' ? 'bg-green-900/50 text-green-300' : 'bg-gray-700 text-gray-300'}`}>{task.status}</span>
            </div>
            <button onClick={() => onEdit(task)} className="p-2 bg-gray-700 rounded-md hover:bg-gray-600"><Settings size={16} /></button>
        </div>
    </div>
);


const TaskLibraryModal: FC<{ isOpen: boolean; onClose: () => void; onSelect: (template: TaskTemplate) => void }> = ({ isOpen, onClose, onSelect }) => {
    const [search, setSearch] = useState('');
    const filteredTasks = useMemo(() => 
        TASK_LIBRARY_TEMPLATES.filter(t => t.name.toLowerCase().includes(search.toLowerCase()) || t.category.toLowerCase().includes(search.toLowerCase())),
        [search]
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-4xl p-0">
                        <div 
                className="p-6 sticky top-0"
                style={{
                    backgroundColor: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)'
                }}
            >
                <h2 
                    className="text-xl font-bold mb-4"
                    style={{ color: 'var(--text-primary)' }}
                >
                    Edit Task
                </h2>
                <p className="text-gray-400 mb-4">Select a predefined task template to get started.</p>
                <div className="relative">
                    <Input placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.map(template => (
                    <button key={template.name} onClick={() => onSelect(template)} className="text-left p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-blue-500 hover:bg-gray-800 transition-all">
                        <template.icon className="w-6 h-6 mb-3 text-blue-400"/>
                        <h3 className="font-semibold text-white">{template.name}</h3>
                        <p className="text-xs text-gray-400 mt-1">{template.category}</p>
                        <p className="text-xs text-gray-500 mt-2">Verify via: {template.verification}</p>
                    </button>
                ))}
            </div>
        </Modal>
    );
};

const TaskConfigurationForm: FC<{ isOpen: boolean; onClose: () => void; taskToEdit?: Task | null }> = ({ isOpen, onClose, taskToEdit }) => {
    // In a real app, this form state would be much more complex.
    const [formState, setFormState] = useState({ name: '', xp: 10, approval: 'auto', uniqueContent: true });

    useEffect(() => {
        if (taskToEdit) {
            setFormState(prev => ({ ...prev, name: taskToEdit.name, xp: taskToEdit.xp }));
        } else {
             setFormState({ name: '', xp: 10, approval: 'auto', uniqueContent: true });
        }
    }, [taskToEdit]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="w-full max-w-2xl p-6">
            <h2 className="text-2xl font-bold text-white mb-2">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h2>
            <p className="text-gray-400 mb-6">Configure the task details, rewards, and rules.</p>
            
            <div className="space-y-6">
                {/* Basic Info */}
                <section>
                    <h3 className="font-semibold text-lg text-gray-200 mb-3 border-b border-gray-700 pb-2">Task Details</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Task Name *</label>
                        <Input placeholder="e.g., Retweet our announcement" value={formState.name} onChange={e => setFormState(s=>({...s, name: e.target.value}))}/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1 mt-4">Description</label>
                        <Textarea placeholder="Provide instructions and context for the ambassador." />
                    </div>
                </section>

                 {/* Rewards */}
                <section>
                    <h3 className="font-semibold text-lg text-gray-200 mb-3 border-b border-gray-700 pb-2">Rewards</h3>
                     <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">XP Reward *</label>
                        <div className="flex items-center gap-2 flex-wrap">
                            {XP_OPTIONS.map(xp => (
                                <button key={xp} onClick={() => setFormState(s=>({...s, xp}))} className={`px-4 py-2 text-sm rounded-md font-semibold transition ${formState.xp === xp ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}>{xp} XP</button>
                            ))}
                             <Input type="number" value={formState.xp} onChange={e => setFormState(s=>({...s, xp: parseInt(e.target.value) || 0}))} className="w-24" placeholder="Custom" />
                        </div>
                    </div>
                </section>
                
                 {/* Rules & Approval */}
                <section>
                    <h3 className="font-semibold text-lg text-gray-200 mb-3 border-b border-gray-700 pb-2">Rules & Approval</h3>
                     <div className="space-y-4">
                        <ToggleSwitch label="Auto-approve on pass" checked={formState.approval === 'auto'} onChange={c => setFormState(s=>({...s, approval: c ? 'auto' : 'manual'}))}/>
                        <ToggleSwitch label="Unique content enforcement" checked={formState.uniqueContent} onChange={c => setFormState(s=>({...s, uniqueContent: c}))}/>
                        {/* Add more toggles for anti-fraud as needed */}
                    </div>
                </section>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-800">
                <button onClick={onClose} className="font-semibold text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-md">Cancel</button>
                <button className="bg-white text-black font-semibold py-2 px-6 rounded-md text-sm hover:bg-gray-200 transition-colors">Save Task</button>
            </div>
        </Modal>
    );
};


//- ============================================================================
//- MAIN PAGE COMPONENT
//- ============================================================================

const DailyTasksPage: NextPage = () => {
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const handleSelectTemplate = (template: TaskTemplate) => {
        setIsLibraryOpen(false);
        setEditingTask({ id: '', name: template.name, description: '', xp: 10, status: 'Draft' }); // Prep for editing
        setIsFormOpen(true);
    };

    const handleEditTask = (task: Task) => {
        setEditingTask(task);
        setIsFormOpen(true);
    };
    
    const handleCloseForm = () => {
        setEditingTask(null);
        setIsFormOpen(false);
    }
    
    return (
        <div className="bg-black min-h-screen text-gray-300 font-sans">
            <Header />
            <main className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-5xl mx-auto">
                    {/* Page Header */}
                    <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Daily Task Configuration</h2>
                            <p className="text-gray-400 mt-1">Add, configure, and manage tasks for this campaign.</p>
                        </div>
                         <button onClick={() => window.history.back()} className="flex items-center gap-2 text-sm font-semibold bg-gray-800 hover:bg-gray-700 px-4 py-2 rounded-lg transition-colors">
                            <ChevronLeft size={16} /> Back to Campaign
                        </button>
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-wrap gap-4 mb-8 p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
                        <button onClick={() => setIsLibraryOpen(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors font-semibold">
                            <Library size={16} /> Open Task Library
                        </button>
                        <button onClick={() => { setEditingTask(null); setIsFormOpen(true); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-colors font-semibold">
                            <Plus size={16} /> Add Custom Task
                        </button>
                        <div className="flex-grow"></div>
                        <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-gray-400 hover:text-white px-4 py-2 rounded-lg transition-colors font-semibold">
                            <FileJson size={16} /> Import JSON
                        </button>
                        <button className="flex-1 sm:flex-none bg-white text-black font-semibold py-2 px-6 rounded-md text-sm hover:bg-gray-200 transition-colors">Activate Tasks</button>
                    </div>

                    {/* Task List */}
                    <div className="space-y-4">
                        {tasks.map(task => (
                            <TaskCard key={task.id} task={task} onEdit={handleEditTask} />
                        ))}
                         {tasks.length === 0 && (
                            <div className="text-center py-12 border-2 border-dashed border-gray-800 rounded-xl">
                                <h3 className="text-lg font-semibold text-gray-400">No tasks configured yet.</h3>
                                <p className="text-gray-500 mt-1">Add tasks from the library or create a custom one.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <TaskLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} onSelect={handleSelectTemplate} />
            <TaskConfigurationForm isOpen={isFormOpen} onClose={handleCloseForm} taskToEdit={editingTask} />
        </div>
    );
};

export default DailyTasksPage;
