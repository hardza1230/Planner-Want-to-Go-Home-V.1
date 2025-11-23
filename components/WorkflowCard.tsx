import React, { useMemo } from 'react';
import { Workflow, Task } from '../types';

interface WorkflowCardProps {
  index: number;
  workflow: Workflow;
  progress: { [key: string]: boolean };
  isEditMode: boolean;
  onToggleTask: (taskId: string) => void;
  onUpdateWorkflowTitle: (id: number, title: string) => void;
  onUpdateTask: (workflowId: number, taskIndex: number, field: keyof Task | 'windowConfig', value: any) => void;
  onDeleteTask: (workflowId: number, taskIndex: number) => void;
  onAddTask: (workflowId: number) => void;
  onDeleteWorkflow: (id: number) => void;
  onRunMacro: (workflow: Workflow) => void;
  onOpenLink: (task: Task) => void;
  onMoveWorkflow: (id: number, direction: 'up' | 'down') => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  index,
  workflow,
  progress,
  isEditMode,
  onToggleTask,
  onUpdateWorkflowTitle,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onDeleteWorkflow,
  onRunMacro,
  onOpenLink,
  onMoveWorkflow
}) => {
  const workflowProgress = useMemo(() => {
    if (workflow.tasks.length === 0) return 0;
    const completed = workflow.tasks.filter((_, idx) => progress[`${workflow.id}-${idx}`]).length;
    return Math.round((completed / workflow.tasks.length) * 100);
  }, [workflow.tasks, progress, workflow.id]);

  const updateWindowConfig = (taskIndex: number, field: string, value: string) => {
      const task = workflow.tasks[taskIndex];
      const currentConfig = task.windowConfig || { x: 0, y: 0, width: 800, height: 600 };
      const numValue = parseInt(value) || 0;
      onUpdateTask(workflow.id, taskIndex, 'windowConfig', { ...currentConfig, [field]: numValue });
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
  };

  return (
    <div className={`rounded-2xl border transition-all duration-300 relative flex flex-col h-full animate-fade-in group hover:shadow-xl hover:-translate-y-1 ${
        isEditMode ? 'bg-white border-primary-light shadow-md' : 'bg-white/80 backdrop-blur-md border-white/60 shadow-lg shadow-teal-100/50'
    }`}>
      
      {/* Decorative Gradient Top */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary to-accent rounded-t-2xl opacity-80"></div>

      {/* Action Buttons Top Right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {isEditMode ? (
           <>
            <div className="flex flex-col mr-1 bg-gray-50 rounded-lg p-0.5 border border-gray-100">
                <button onClick={() => onMoveWorkflow(workflow.id, 'up')} className="text-gray-400 hover:text-primary p-1 hover:bg-white rounded"><i className="fas fa-chevron-up text-xs"></i></button>
                <button onClick={() => onMoveWorkflow(workflow.id, 'down')} className="text-gray-400 hover:text-primary p-1 hover:bg-white rounded"><i className="fas fa-chevron-down text-xs"></i></button>
            </div>
            <button 
                onClick={() => onDeleteWorkflow(workflow.id)}
                className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
            >
                <i className="fas fa-trash-alt text-sm"></i>
            </button>
           </>
        ) : (
          workflow.tasks.length > 0 && (
            <button 
              onClick={() => onRunMacro(workflow)}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-emerald-500/30 transition-all active:scale-95"
              title="Run Automation Macro"
            >
              <i className="fas fa-play text-sm"></i>
            </button>
          )
        )}
      </div>

      <div className="p-6 flex flex-col h-full">
        {/* Header */}
        <div className="mb-5 pr-12">
          {isEditMode ? (
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">{index + 1}</div>
                <input 
                type="text" 
                value={workflow.title}
                onChange={(e) => onUpdateWorkflowTitle(workflow.id, e.target.value)}
                className="text-lg font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-2 py-1 focus:border-primary focus:ring-2 focus:ring-primary-light outline-none w-full placeholder-gray-400"
                placeholder="Workflow Title"
                />
            </div>
          ) : (
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Workflow {index + 1}</span>
                 </div>
                 <div className="flex justify-between items-end">
                    <h3 className="text-xl font-bold text-gray-800 leading-tight">{workflow.title}</h3>
                    <span className={`text-sm font-bold ${workflowProgress === 100 ? 'text-emerald-500' : 'text-primary'}`}>{workflowProgress}%</span>
                 </div>
            </div>
          )}
        </div>

        {/* Progress Bar (View Mode Only) */}
        {!isEditMode && workflow.tasks.length > 0 && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mb-6 overflow-hidden">
            <div 
              className={`h-1.5 rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-primary to-accent`} 
              style={{ width: `${workflowProgress}%` }}
            ></div>
          </div>
        )}

        {/* Tasks List */}
        <div className="flex-grow space-y-3">
          {workflow.tasks.map((task, taskIdx) => {
            const taskId = `${workflow.id}-${taskIdx}`;
            const isChecked = !!progress[taskId];
            const taskType = task.type || 'link'; // Default to link
            
            if (isEditMode) {
              return (
                <div key={taskIdx} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50 hover:bg-white hover:shadow-md transition-all relative group/edit">
                  <div className="absolute top-2 right-2 opacity-0 group-hover/edit:opacity-100 transition-opacity">
                        <button 
                            onClick={() => onDeleteTask(workflow.id, taskIdx)}
                            className="text-gray-300 hover:text-red-500 p-1"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                  </div>

                  {/* Task Name & Type Selector */}
                  <div className="flex gap-2">
                       <div className="flex-grow">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Task Name</label>
                            <input 
                                type="text" 
                                value={task.name}
                                onChange={(e) => onUpdateTask(workflow.id, taskIdx, 'name', e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none placeholder-gray-400"
                                placeholder="Task Name"
                            />
                       </div>
                       <div className="w-1/3 min-w-[100px]">
                            <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Action Type</label>
                            <select 
                                value={taskType}
                                onChange={(e) => onUpdateTask(workflow.id, taskIdx, 'type', e.target.value)}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer"
                            >
                                <option value="link">Open Link/App</option>
                                <option value="delay">Wait (Delay)</option>
                                <option value="keys">Send Keys</option>
                            </select>
                       </div>
                  </div>

                  {/* Configuration Based on Type */}
                  <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        {taskType === 'link' && (
                            <div className="space-y-2">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Target Path / URL</label>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-400">
                                            <i className="fas fa-link text-xs"></i>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={task.link}
                                            onChange={(e) => onUpdateTask(workflow.id, taskIdx, 'link', e.target.value)}
                                            className="flex-grow px-2 py-1 text-xs border border-gray-200 rounded bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none font-mono"
                                            placeholder="C:\App.exe or https://..."
                                        />
                                    </div>
                                </div>
                                {/* Window Config Toggle */}
                                <div className="pt-2 border-t border-gray-100">
                                    <details className="text-xs">
                                        <summary className="cursor-pointer text-primary font-medium hover:text-primary-dark select-none">Window Size & Position (Optional)</summary>
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {['x', 'y', 'width', 'height'].map((field) => (
                                                <div key={field}>
                                                    <label className="text-[9px] text-gray-400 block uppercase">{field}</label>
                                                    <input 
                                                        type="number" 
                                                        className="w-full p-1 text-xs border border-gray-200 rounded bg-gray-50 text-gray-900 focus:ring-1 focus:ring-primary outline-none" 
                                                        placeholder="0"
                                                        value={(task.windowConfig as any)?.[field] ?? (field === 'width' || field === 'height' ? 800 : 0)}
                                                        onChange={(e) => updateWindowConfig(taskIdx, field, e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            </div>
                        )}

                        {taskType === 'delay' && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Wait Duration (Milliseconds)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded bg-amber-50 flex items-center justify-center text-amber-500">
                                        <i className="fas fa-clock text-xs"></i>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={task.value}
                                        onChange={(e) => onUpdateTask(workflow.id, taskIdx, 'value', e.target.value)}
                                        className="flex-grow px-2 py-1 text-sm border border-gray-200 rounded bg-white text-gray-900 focus:ring-2 focus:ring-amber-200 focus:border-amber-300 outline-none font-mono"
                                        placeholder="e.g. 5000"
                                    />
                                    <span className="text-xs text-gray-400">ms</span>
                                </div>
                            </div>
                        )}

                        {taskType === 'keys' && (
                            <div>
                                <label className="text-[10px] font-bold text-gray-400 uppercase mb-1 block">Keystroke Combination</label>
                                <div className="flex gap-2 items-center">
                                    <div className="w-8 h-8 rounded bg-purple-50 flex items-center justify-center text-purple-500">
                                        <i className="fas fa-keyboard text-xs"></i>
                                    </div>
                                    <input 
                                        type="text" 
                                        value={task.value}
                                        onChange={(e) => onUpdateTask(workflow.id, taskIdx, 'value', e.target.value)}
                                        className="flex-grow px-2 py-1 text-sm border border-gray-200 rounded bg-white text-gray-900 focus:ring-2 focus:ring-purple-200 focus:border-purple-300 outline-none font-mono"
                                        placeholder="e.g. Ctrl+R, F5, Alt+Tab"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 pl-10">*Requires desktop agent for actual key presses.</p>
                            </div>
                        )}
                  </div>
                </div>
              );
            }

            // --- VIEW MODE ---
            return (
              <div key={taskIdx} className="flex items-center group/item hover:bg-teal-50/50 p-1.5 -mx-1.5 rounded-lg transition-colors">
                <div className="relative flex items-center">
                    <input 
                        type="checkbox" 
                        id={taskId}
                        checked={isChecked}
                        onChange={() => onToggleTask(taskId)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border-2 border-gray-300 checked:bg-primary checked:border-primary transition-all hover:border-primary/50"
                    />
                    <i className="fas fa-check absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none text-xs left-1 top-1"></i>
                </div>
                
                <div className="ml-3 flex-grow min-w-0 flex justify-between items-center">
                    <label 
                        htmlFor={taskId} 
                        className={`cursor-pointer select-none transition-all truncate flex items-center gap-2 ${isChecked ? 'text-gray-400 line-through' : 'text-gray-700'}`}
                    >
                        {/* Icon based on Type */}
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs shrink-0 ${
                            isChecked ? 'bg-gray-100 text-gray-300' : 
                            taskType === 'delay' ? 'bg-amber-100 text-amber-600' :
                            taskType === 'keys' ? 'bg-purple-100 text-purple-600' :
                            'bg-primary-light text-primary'
                        }`}>
                            <i className={`fas ${
                                taskType === 'delay' ? 'fa-clock' :
                                taskType === 'keys' ? 'fa-keyboard' :
                                task.link?.startsWith('http') ? 'fa-globe' : 'fa-folder'
                            }`}></i>
                        </span>

                        {taskType === 'link' && task.link && task.link !== '#' ? (
                            <button 
                                onClick={(e) => { e.preventDefault(); onOpenLink(task); }}
                                className="text-left hover:text-primary hover:underline truncate"
                            >
                                {task.name}
                            </button>
                        ) : (
                            <span className="truncate">{task.name}</span>
                        )}
                        
                        {/* Detail Badge */}
                        {taskType === 'delay' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2">{task.value}ms</span>}
                        {taskType === 'keys' && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-2 border border-gray-200 font-mono">{task.value}</span>}

                    </label>

                    {/* Quick Copy Action */}
                    {taskType === 'link' && task.link && task.link !== '#' && !task.link.startsWith('http') && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); copyToClipboard(task.link || ''); }}
                            className="opacity-0 group-hover/item:opacity-100 text-gray-300 hover:text-primary px-2 transition-all transform hover:scale-110"
                            title="Copy Path"
                        >
                            <i className="fas fa-copy"></i>
                        </button>
                    )}
                </div>
              </div>
            );
          })}
        </div>

        {isEditMode && (
            <button 
                onClick={() => onAddTask(workflow.id)}
                className="mt-6 w-full py-2.5 border-2 border-dashed border-gray-200 text-gray-400 rounded-xl hover:bg-white hover:border-primary/50 hover:text-primary transition-all text-sm font-semibold flex items-center justify-center gap-2"
            >
                <i className="fas fa-plus-circle"></i> Add Task
            </button>
        )}
      </div>
    </div>
  );
};