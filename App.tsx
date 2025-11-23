import React, { useState, useEffect, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { WorkflowCard } from './components/WorkflowCard';
import { IconPicker } from './components/IconPicker';
import { Task, Workflow, Shortcut, DailyProgress, NotificationState, Tool, WatchedFolder, FileAlert } from './types';
import { DEFAULT_WORKFLOWS, DEFAULT_SHORTCUTS, DEFAULT_TOOLS } from './constants';

function App() {
  // State: Data
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('tasksMasterData');
    return saved ? JSON.parse(saved) : DEFAULT_WORKFLOWS;
  });
  const [shortcuts, setShortcuts] = useState<Shortcut[]>(() => {
    const saved = localStorage.getItem('shortcutsMasterData');
    return saved ? JSON.parse(saved) : DEFAULT_SHORTCUTS;
  });
  const [tools, setTools] = useState<Tool[]>(() => {
    const saved = localStorage.getItem('toolsMasterData');
    return saved ? JSON.parse(saved) : DEFAULT_TOOLS;
  });
  const [watchedFolders, setWatchedFolders] = useState<WatchedFolder[]>(() => {
    const saved = localStorage.getItem('watchedFoldersData');
    return saved ? JSON.parse(saved) : [{ id: 1, name: 'Downloads', path: 'C:\\Users\\User\\Downloads' }];
  });
  
  // State: UI & Control
  const [date, setDate] = useState<Date>(new Date());
  const [dailyProgress, setDailyProgress] = useState<DailyProgress>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<NotificationState>({ show: false, title: '', message: '', type: 'info' });
  const [fileAlerts, setFileAlerts] = useState<FileAlert[]>([]);
  
  // Modals
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [deleteWorkflowId, setDeleteWorkflowId] = useState<number | null>(null);
  
  // Icon Picker State
  const [iconPickerState, setIconPickerState] = useState<{ 
      isOpen: boolean, 
      type: 'shortcut' | 'tool' | null, 
      index: number | null 
  }>({ isOpen: false, type: null, index: null });

  // Utils
  const formatDate = (d: Date) => {
    return d.toISOString().split('T')[0];
  };

  const showNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ show: true, title, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const openLink = (target: string | Task) => {
    let link = '';
    let windowConfig = null;
    let type = 'link';
    let value = '';

    if (typeof target === 'string') {
        link = target;
    } else {
        link = target.link || '';
        windowConfig = target.windowConfig;
        type = target.type || 'link';
        value = target.value || '';
    }

    // Handle different Task Types
    if (type === 'delay') {
        // Delay is handled in the macro runner mainly, but if clicked individually, show info
        const ms = parseInt(value) || 0;
        showNotification('Simulation', `Waiting for ${ms}ms...`, 'info');
        return;
    }
    
    if (type === 'keys') {
        // Simulate Key Press
        showNotification('Key Press Simulation', `Sending keys: ${value}`, 'success');
        return;
    }

    // Handle Link Opening
    if (!link || link === '#') return;
    
    if (link.startsWith('http')) {
        window.open(link, '_blank');
        if (windowConfig) {
             console.log(`Web Constraint: Cannot resize browser tab to ${windowConfig.width}x${windowConfig.height} at ${windowConfig.x},${windowConfig.y}`);
        }
    } else {
        // In a real Electron app, we would use ipcRenderer here.
        let msg = `Opening "${link}"`;
        if (windowConfig) {
            msg += ` (Window: ${windowConfig.width}x${windowConfig.height} at ${windowConfig.x},${windowConfig.y})`;
        }
        showNotification(
            'System Action', 
            msg, 
            'success'
        );
    }
  };

  // Effects for Persistence
  useEffect(() => { localStorage.setItem('tasksMasterData', JSON.stringify(workflows)); }, [workflows]);
  useEffect(() => { localStorage.setItem('shortcutsMasterData', JSON.stringify(shortcuts)); }, [shortcuts]);
  useEffect(() => { localStorage.setItem('toolsMasterData', JSON.stringify(tools)); }, [tools]);
  useEffect(() => { localStorage.setItem('watchedFoldersData', JSON.stringify(watchedFolders)); }, [watchedFolders]);

  // Load daily progress when date changes
  useEffect(() => {
    const dateKey = `dailyTaskProgress-${formatDate(date)}`;
    const savedProgress = localStorage.getItem(dateKey);
    setDailyProgress(savedProgress ? JSON.parse(savedProgress) : {});
  }, [date]);

  // Save daily progress when it changes
  useEffect(() => {
    const dateKey = `dailyTaskProgress-${formatDate(date)}`;
    localStorage.setItem(dateKey, JSON.stringify(dailyProgress));
  }, [dailyProgress, date]);

  // --- MOCK FOLDER WATCHER SIMULATION ---
  useEffect(() => {
      // Simulate checking for new files every 30 seconds
      if (watchedFolders.length === 0) return;

      const interval = setInterval(() => {
          const randomFolder = watchedFolders[Math.floor(Math.random() * watchedFolders.length)];
          const shouldTrigger = Math.random() > 0.7; // 30% chance to find a file

          if (shouldTrigger) {
              const mockFiles = ['Report_2025.pdf', 'Data_Export.csv', 'Invoice_A110.xlsx', 'Log_Error.txt'];
              const randomFile = mockFiles[Math.floor(Math.random() * mockFiles.length)];
              
              const newAlert: FileAlert = {
                  id: Date.now().toString(),
                  folderId: randomFolder.id,
                  fileName: randomFile,
                  path: `${randomFolder.path}\\${randomFile}`,
                  timestamp: new Date()
              };

              setFileAlerts(prev => [newAlert, ...prev]);
              showNotification('Folder Watcher', `New file detected in ${randomFolder.name}`, 'info');
          }
      }, 15000); // Check every 15s for demo purposes

      return () => clearInterval(interval);
  }, [watchedFolders]);


  // Logic: Workflows & Tasks
  const toggleTask = (taskId: string) => {
    setDailyProgress(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const updateWorkflowTitle = (id: number, title: string) => {
    setWorkflows(prev => prev.map(w => w.id === id ? { ...w, title } : w));
  };

  const updateTask = (workflowId: number, taskIndex: number, field: keyof Task | 'windowConfig', value: any) => {
    setWorkflows(prev => prev.map(w => {
      if (w.id !== workflowId) return w;
      const newTasks = [...w.tasks];
      newTasks[taskIndex] = { ...newTasks[taskIndex], [field]: value };
      return { ...w, tasks: newTasks };
    }));
  };

  const addTask = (workflowId: number) => {
    setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        return { ...w, tasks: [...w.tasks, { name: 'New Task', type: 'link', link: '' }] };
    }));
  };

  const deleteTask = (workflowId: number, taskIndex: number) => {
    setWorkflows(prev => prev.map(w => {
        if (w.id !== workflowId) return w;
        const newTasks = [...w.tasks];
        newTasks.splice(taskIndex, 1);
        return { ...w, tasks: newTasks };
    }));
  };

  const deleteWorkflow = () => {
    if (deleteWorkflowId === null) return;
    setWorkflows(prev => prev.filter(w => w.id !== deleteWorkflowId));
    setDeleteWorkflowId(null);
  };

  const addWorkflow = () => {
    const newId = workflows.length > 0 ? Math.max(...workflows.map(w => w.id)) + 1 : 1;
    setWorkflows([...workflows, { id: newId, title: 'New Workflow', tasks: [] }]);
  };

  const moveWorkflow = (id: number, direction: 'up' | 'down') => {
    const index = workflows.findIndex(w => w.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === workflows.length - 1) return;

    const newWorkflows = [...workflows];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWorkflows[index], newWorkflows[targetIndex]] = [newWorkflows[targetIndex], newWorkflows[index]];
    setWorkflows(newWorkflows);
  };

  const runMacro = async (workflow: Workflow) => {
    // Advanced Macro Runner
    const tasksToRun = workflow.tasks; // Run all, let the loop handle types
    
    if (tasksToRun.length === 0) {
        showNotification('Macro', 'No tasks to run.', 'info');
        return;
    }
    
    showNotification('Macro Running', `Starting workflow "${workflow.title}"...`, 'success');
    
    for (const task of tasksToRun) {
        const type = task.type || 'link';

        if (type === 'delay') {
            const ms = parseInt(task.value || '1000');
            console.log(`Waiting ${ms}ms...`);
            await new Promise(resolve => setTimeout(resolve, ms));
        } else if (type === 'keys') {
            showNotification('Auto-Type', `Sending: ${task.value}`, 'info');
            // Simulate processing time for keys
            await new Promise(resolve => setTimeout(resolve, 500));
        } else {
             // Link
             if (task.link && task.link !== '#') {
                 openLink(task);
                 // Default small delay between opening apps to prevent freezing
                 await new Promise(resolve => setTimeout(resolve, 800));
             }
        }
    }
    showNotification('Macro Finished', 'All tasks executed.', 'success');
  };

  // Logic: Shortcuts
  const updateShortcut = (index: number, field: keyof Shortcut, value: string) => {
    setShortcuts(prev => {
        const next = [...prev];
        next[index] = { ...next[index], [field]: value };
        return next;
    });
  };
  const addShortcut = () => setShortcuts(prev => [...prev, { id: Date.now(), name: 'New Shortcut', link: '', icon: 'fa-link' }]);
  const removeShortcut = (index: number) => setShortcuts(prev => prev.filter((_, i) => i !== index));

  // Logic: Tools
  const updateTool = (index: number, field: keyof Tool, value: string) => {
      setTools(prev => {
          const next = [...prev];
          next[index] = { ...next[index], [field]: value };
          return next;
      });
  };
  const addTool = () => setTools(prev => [...prev, { id: Date.now(), name: 'New Tool', link: '', icon: 'fa-wrench' }]);
  const removeTool = (index: number) => setTools(prev => prev.filter((_, i) => i !== index));

  // Logic: Watchers
  const addWatcher = () => setWatchedFolders(prev => [...prev, { id: Date.now(), name: 'New Folder', path: 'C:\\' }]);
  const removeWatcher = (id: number) => setWatchedFolders(prev => prev.filter(w => w.id !== id));
  const updateWatcher = (id: number, field: keyof WatchedFolder, value: string) => {
      setWatchedFolders(prev => prev.map(w => w.id === id ? { ...w, [field]: value } : w));
  };
  const dismissAlert = (id: string) => setFileAlerts(prev => prev.filter(a => a.id !== id));

  // Logic: General
  const clearDailyData = () => {
    setDailyProgress({});
    setIsClearModalOpen(false);
    showNotification('Success', 'Today\'s progress has been reset.', 'success');
  };

  const handleExport = () => {
    const dataStr = JSON.stringify({ workflows, shortcuts, tools, watchedFolders }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'task-tracker-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const json = JSON.parse(ev.target?.result as string);
                if (json.workflows) setWorkflows(json.workflows);
                if (json.shortcuts) setShortcuts(json.shortcuts);
                if (json.tools) setTools(json.tools);
                if (json.watchedFolders) setWatchedFolders(json.watchedFolders);
                showNotification('Success', 'Configuration imported successfully', 'success');
            } catch (err) {
                // Fallback for old format (just workflows array)
                try {
                    const json = JSON.parse(ev.target?.result as string);
                    if (Array.isArray(json)) {
                         setWorkflows(json);
                         showNotification('Success', 'Legacy template imported', 'success');
                    } else {
                        throw new Error();
                    }
                } catch {
                    showNotification('Error', 'Invalid configuration file', 'error');
                }
            }
        };
        reader.readAsText(file);
    };
    input.click();
  };

  const saveToHtml = () => showNotification('HTML Export', 'Feature ready for implementation.', 'success');

  // Computed Data
  const filteredWorkflows = useMemo(() => {
    if (!searchQuery) return workflows;
    const q = searchQuery.toLowerCase();
    return workflows.filter(w => 
        w.title.toLowerCase().includes(q) || 
        w.tasks.some(t => t.name.toLowerCase().includes(q))
    );
  }, [workflows, searchQuery]);

  const stats = useMemo(() => {
    let total = 0;
    let completed = 0;
    filteredWorkflows.forEach(w => {
        w.tasks.forEach((_, idx) => {
            total++;
            if (dailyProgress[`${w.id}-${idx}`]) completed++;
        });
    });
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    let colorClass = 'bg-rose-400';
    if (percentage >= 50) colorClass = 'bg-accent';
    if (percentage >= 80) colorClass = 'bg-primary';

    return { total, completed, percentage, colorClass };
  }, [filteredWorkflows, dailyProgress]);


  return (
    <div className="flex min-h-screen font-sans bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 text-gray-800">
      {/* Sidebar */}
      <Sidebar 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        shortcuts={shortcuts}
        tools={tools}
        watchedFolders={watchedFolders}
        fileAlerts={fileAlerts}
        isEditMode={isEditMode}
        onEditShortcut={updateShortcut}
        onDeleteShortcut={removeShortcut}
        onAddShortcut={addShortcut}
        onChangeShortcutIcon={(idx) => setIconPickerState({ isOpen: true, type: 'shortcut', index: idx })}
        onEditTool={updateTool}
        onDeleteTool={removeTool}
        onAddTool={addTool}
        onChangeToolIcon={(idx) => setIconPickerState({ isOpen: true, type: 'tool', index: idx })}
        onAddWatcher={addWatcher}
        onRemoveWatcher={removeWatcher}
        onEditWatcher={updateWatcher}
        onDismissAlert={dismissAlert}
        onOpenLink={openLink}
        onImport={handleImport}
        onExport={handleExport}
        onSaveHtml={saveToHtml}
      />

      {/* Main Content */}
      <div className="flex-grow overflow-x-hidden">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
            
            {/* Header Area */}
            <header className="mb-8 sticky top-0 z-20 py-4 -mx-8 px-8 bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm transition-all">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-dark via-primary to-accent bg-clip-text text-transparent">Dashboard</h1>
                        <p className="text-sm text-gray-500">Overview of your daily operations</p>
                    </div>
                    
                    <div className="flex items-center gap-3 flex-wrap">
                         {/* Search */}
                        <div className="relative group">
                            <input 
                                type="search" 
                                placeholder="Search tasks..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-64 bg-white/80 p-2.5 pl-10 border border-primary-light rounded-xl shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all group-hover:shadow-md"
                            />
                            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        
                        {/* Date Picker */}
                        <div className="flex items-center gap-2 bg-white/80 p-1 rounded-xl border border-primary-light shadow-sm">
                            <input 
                                type="date" 
                                value={formatDate(date)}
                                onChange={(e) => setDate(new Date(e.target.value))}
                                className="bg-transparent p-1.5 rounded-lg focus:outline-none text-sm font-medium text-gray-700"
                            />
                            <button 
                                onClick={() => setDate(new Date())}
                                className="px-3 py-1.5 bg-teal-50 rounded-lg text-xs font-bold text-primary hover:bg-teal-100 transition-colors"
                            >
                                TODAY
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats & Progress */}
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                     <div className="flex items-center gap-4 bg-white/50 p-3 rounded-2xl border border-white/60 shadow-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-md ${stats.colorClass}`}>
                            {stats.percentage}%
                        </div>
                        <div className="flex-grow">
                             <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-gray-600">Daily Progress</span>
                                <span className="text-gray-400 font-medium">{stats.completed} / {stats.total} Tasks</span>
                             </div>
                             <div className="w-full bg-gray-200/50 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-700 ease-out ${stats.colorClass}`}
                                    style={{ width: `${stats.percentage}%` }}
                                ></div>
                            </div>
                        </div>
                     </div>
                </div>
            </header>

            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <i className="fas fa-layer-group text-primary"></i>
                    Workflows
                </h2>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-all shadow-sm flex items-center ${isEditMode ? 'bg-primary-dark text-white hover:bg-black' : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'}`}
                    >
                        <i className={`fas ${isEditMode ? 'fa-check' : 'fa-sliders-h'} mr-2`}></i>
                        {isEditMode ? 'Done' : 'Customize'}
                    </button>
                    
                    <button 
                        onClick={() => setIsClearModalOpen(true)}
                        className="px-4 py-2 rounded-xl font-semibold bg-white border border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm flex items-center"
                    >
                        <i className="fas fa-trash-alt mr-2"></i>
                        Clear
                    </button>
                </div>
            </div>

            {/* Task Grid */}
            <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {filteredWorkflows.map((workflow, index) => (
                    <WorkflowCard 
                        key={workflow.id}
                        index={index}
                        workflow={workflow}
                        progress={dailyProgress}
                        isEditMode={isEditMode}
                        onToggleTask={toggleTask}
                        onUpdateWorkflowTitle={updateWorkflowTitle}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                        onAddTask={addTask}
                        onDeleteWorkflow={(id) => setDeleteWorkflowId(id)}
                        onRunMacro={runMacro}
                        onOpenLink={openLink}
                        onMoveWorkflow={moveWorkflow}
                    />
                ))}
                
                {isEditMode && (
                    <button 
                        onClick={addWorkflow}
                        className="bg-white/40 hover:bg-white/80 border-2 border-dashed border-primary-light hover:border-primary rounded-2xl p-6 flex flex-col items-center justify-center text-teal-400 hover:text-primary transition-all duration-300 min-h-[250px] group backdrop-blur-sm"
                    >
                        <div className="w-16 h-16 rounded-full bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                             <i className="fas fa-plus fa-lg"></i>
                        </div>
                        <span className="font-semibold text-lg">Create New Workflow</span>
                        <span className="text-xs mt-2 opacity-70">Add a new group of tasks</span>
                    </button>
                )}
            </main>
        </div>
      </div>

      {/* Notification Toast */}
      <div 
        className={`fixed bottom-5 right-5 p-4 rounded-xl shadow-2xl transform transition-all duration-300 z-50 max-w-sm border backdrop-blur-md ${
          notification.show ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'
        } ${
            notification.type === 'success' ? 'bg-white/90 border-mint text-emerald-800' : 
            notification.type === 'error' ? 'bg-white/90 border-red-200 text-red-800' : 
            'bg-white/90 border-primary-light text-primary-dark'
        }`}
      >
        <div className="flex items-start gap-3">
             <div className={`mt-0.5 ${
                 notification.type === 'success' ? 'text-emerald-500' : 
                 notification.type === 'error' ? 'text-red-500' : 'text-primary'
             }`}>
                 <i className={`fas ${
                     notification.type === 'success' ? 'fa-check-circle' : 
                     notification.type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle'
                 }`}></i>
             </div>
             <div>
                <h4 className="font-bold text-sm mb-0.5">{notification.title}</h4>
                <p className="text-xs opacity-90 leading-relaxed">{notification.message}</p>
             </div>
        </div>
      </div>

      {/* Clear Confirmation Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 border border-white/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                        <i className="fas fa-trash-alt"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Clear Daily Progress?</h3>
                    <p className="text-gray-500 text-sm">Are you sure you want to reset all checkboxes? This action cannot be undone.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setIsClearModalOpen(false)} className="flex-1 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={clearDailyData} className="flex-1 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Yes, Clear All</button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Workflow Confirmation Modal */}
      {deleteWorkflowId !== null && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md transform transition-all scale-100 border border-white/20">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                        <i className="fas fa-exclamation-triangle"></i>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Delete Workflow?</h3>
                    <p className="text-gray-500 text-sm">This workflow and all its tasks will be permanently deleted.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setDeleteWorkflowId(null)} className="flex-1 py-2.5 rounded-xl font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button onClick={deleteWorkflow} className="flex-1 py-2.5 rounded-xl font-semibold bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/30 transition-colors">Delete</button>
                </div>
            </div>
        </div>
      )}

      {/* Icon Picker Modal */}
      <IconPicker 
        isOpen={iconPickerState.isOpen} 
        onClose={() => setIconPickerState({ isOpen: false, type: null, index: null })}
        onSelect={(icon) => {
            if (iconPickerState.type === 'shortcut' && iconPickerState.index !== null) {
                updateShortcut(iconPickerState.index, 'icon', icon);
            } else if (iconPickerState.type === 'tool' && iconPickerState.index !== null) {
                updateTool(iconPickerState.index, 'icon', icon);
            }
            setIconPickerState({ isOpen: false, type: null, index: null });
        }}
      />

    </div>
  );
}

export default App;