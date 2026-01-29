import React, { useState } from 'react';
import type { Task } from '../types';
import { CheckBadgeIcon, PlusIcon, TrashIcon, BrainIcon } from './icons';
import { prioritizeTasks } from '../services/geminiService';

interface TasksViewProps {
    tasks: Task[];
    onUpdateTasks: (newTasks: Task[]) => void;
    checkTokens: (cost: number) => boolean;
    t: (key: string) => string;
}

export const TasksView: React.FC<TasksViewProps> = ({ tasks, onUpdateTasks, checkTokens, t }) => {
    const [newTaskText, setNewTaskText] = useState('');
    const [isPrioritizing, setIsPrioritizing] = useState(false);

    const handleAddTask = () => {
        if (newTaskText.trim()) {
            const newTask: Task = {
                id: `task-${Date.now()}`,
                text: newTaskText.trim(),
                completed: false,
            };
            onUpdateTasks([...tasks, newTask]);
            setNewTaskText('');
        }
    };

    const handleToggleTask = (id: string) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, completed: !task.completed } : task
        );
        onUpdateTasks(updatedTasks);
    };
    
    const handleDeleteTask = (id: string) => {
        onUpdateTasks(tasks.filter(task => task.id !== id));
    };

    const handleAiPrioritize = async () => {
        const pendingTasks = tasks.filter(t => !t.completed);
        if (pendingTasks.length < 2) return;

        setIsPrioritizing(true);
        try {
            const prioritizedTaskTexts = await prioritizeTasks(pendingTasks.map(t => t.text), t);
            
            // Create a map for quick lookup of original tasks by their text
            const taskMap = new Map(pendingTasks.map(t => [t.text, t]));
            
            // Reorder the original task objects based on the new text order
            const reorderedTasks: Task[] = prioritizedTaskTexts
                .map(text => taskMap.get(text))
                .filter((task): task is Task => task !== undefined);

            const completedTasks = tasks.filter(t => t.completed);
            onUpdateTasks([...reorderedTasks, ...completedTasks]);

        } catch (error) {
            console.error("Failed to prioritize tasks:", error);
            alert(t('error_generic_title'));
        } finally {
            setIsPrioritizing(false);
        }
    };

    const completedTasks = tasks.filter(t => t.completed);
    const pendingTasks = tasks.filter(t => !t.completed);

    return (
        <div className="space-y-6 animate-assemble-in">
            {/* Add Task Input */}
            <div className="polished-pane p-4">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                        placeholder={t('tasks_add_placeholder')}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-lg text-[var(--text-primary)] px-4 py-2 focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent"
                    />
                    <button
                        onClick={handleAddTask}
                        className="flex-shrink-0 flex items-center gap-2 bg-[var(--accent-primary)] text-black font-bold py-2 px-4 rounded-lg transition-transform transform hover:scale-105"
                    >
                        <PlusIcon className="h-5 w-5" />
                        <span>{t('button_add')}</span>
                    </button>
                </div>
            </div>

            {/* Pending Tasks */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-[var(--text-primary)]">{t('tasks_pending_title')} ({pendingTasks.length})</h3>
                    {pendingTasks.length > 1 && (
                         <button 
                            onClick={handleAiPrioritize} 
                            disabled={isPrioritizing}
                            className="flex items-center gap-2 polished-pane p-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] interactive-hover disabled:opacity-50"
                        >
                            <BrainIcon className="h-5 w-5" />
                            <span>{isPrioritizing ? t('tasks_prioritizing') : t('tasks_ai_prioritize')}</span>
                         </button>
                    )}
                </div>
                <div className="space-y-3">
                    {pendingTasks.map(task => (
                        <div key={task.id} className="polished-pane p-3 flex items-center gap-4 transition-all hover:border-[var(--border-color)]">
                            <input
                                type="checkbox"
                                checked={task.completed}
                                onChange={() => handleToggleTask(task.id)}
                                className="h-5 w-5 rounded bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                            />
                            <p className="flex-1 text-[var(--text-primary)]">{task.text}</p>
                            <button onClick={() => handleDeleteTask(task.id)} className="text-[var(--text-secondary)] hover:text-red-400">
                                <TrashIcon className="h-5 w-5" />
                            </button>
                        </div>
                    ))}
                    {pendingTasks.length === 0 && (
                        <p className="text-center text-[var(--text-secondary)] py-4">{t('tasks_none_pending')}</p>
                    )}
                </div>
            </div>

            {/* Completed Tasks */}
            {completedTasks.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-[var(--text-primary)]">{t('tasks_completed_title')} ({completedTasks.length})</h3>
                    <div className="space-y-3">
                        {completedTasks.map(task => (
                             <div key={task.id} className="polished-pane p-3 flex items-center gap-4 bg-green-900/10 border-green-500/20">
                                <input
                                    type="checkbox"
                                    checked={task.completed}
                                    onChange={() => handleToggleTask(task.id)}
                                    className="h-5 w-5 rounded bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] cursor-pointer"
                                />
                                <p className="flex-1 text-[var(--text-secondary)] line-through">{task.text}</p>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-[var(--text-secondary)] hover:text-red-400">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};