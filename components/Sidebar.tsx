import React, { useState } from 'react';
import { Shortcut, Tool, WatchedFolder, FileAlert } from '../types';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  shortcuts: Shortcut[];
  tools: Tool[];
  watchedFolders: WatchedFolder[];
  fileAlerts: FileAlert[];
  isEditMode: boolean;
  
  // Shortcut Actions
  onEditShortcut: (index: number, field: keyof Shortcut, value: string) => void;
  onDeleteShortcut: (index: number) => void;
  onAddShortcut: () => void;
  onChangeShortcutIcon: (index: number) => void;
  
  // Tool Actions
  onEditTool: (index: number, field: keyof Tool, value: string) => void;
  onDeleteTool: (index: number) => void;
  onAddTool: () => void;
  onChangeToolIcon: (index: number) => void;

  // Watcher Actions
  onAddWatcher: () => void;
  onRemoveWatcher: (id: number) => void;
  onEditWatcher: (id: number, field: keyof WatchedFolder, value: string) => void;
  onDismissAlert: (id: string) => void;

  onOpenLink: (link: string) => void;
  onImport: () => void;
  onExport: () => void;
  onSaveHtml: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  shortcuts,
  tools,
  watchedFolders,
  fileAlerts,
  isEditMode,
  onEditShortcut,
  onDeleteShortcut,
  onAddShortcut,
  onChangeShortcutIcon,
  onEditTool,
  onDeleteTool,
  onAddTool,
  onChangeToolIcon,
  onAddWatcher,
  onRemoveWatcher,
  onEditWatcher,
  onDismissAlert,
  onOpenLink,
  onImport,
  onExport,
  onSaveHtml
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'watcher'>('main');

  return (
    <aside 
      className={`h-screen sticky top-0 flex flex-col transition-all duration-300 ease-in-out z-30 border-r border-primary-light shadow-xl backdrop-blur-xl bg-white/70 ${collapsed ? 'w-20 p-2' : 'w-80 p-5'}`}
    >
      {/* Header */}
      <div className={`flex items-center mb-8 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
            <div className="flex flex-col">
                <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">Task Tracker</h2>
                <span className="text-xs text-primary font-medium">Pro Edition</span>
            </div>
        )}
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-2 rounded-xl hover:bg-white/50 text-gray-500 hover:text-primary transition-all shadow-sm border border-transparent hover:border-primary-light"
        >
          <i className="fa-solid fa-bars"></i>
        </button>
      </div>

      {/* Watcher Toggle (Only visible if not collapsed) */}
      {!collapsed && (
          <div className="flex mb-6 bg-teal-50/50 p-1 rounded-xl border border-primary-light">
              <button 
                  onClick={() => setActiveTab('main')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'main' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Main
              </button>
              <button 
                  onClick={() => setActiveTab('watcher')}
                  className={`flex-1 py-1.5 text-sm font-semibold rounded-lg transition-all relative ${activeTab === 'watcher' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
              >
                  Watcher
                  {fileAlerts.length > 0 && (
                      <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></span>
                  )}
              </button>
          </div>
      )}
      
      {/* --- WATCHER TAB --- */}
      {!collapsed && activeTab === 'watcher' && (
        <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-4 animate-fade-in pr-1">
           
           {/* Alerts Section */}
           <div>
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">New Files ({fileAlerts.length})</h3>
               {fileAlerts.length === 0 ? (
                   <div className="text-gray-400 text-sm text-center py-8 border-2 border-dashed border-gray-200/50 rounded-xl bg-gray-50/30">
                       No new files detected
                   </div>
               ) : (
                   <div className="space-y-3">
                       {fileAlerts.map(alert => (
                           <div key={alert.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-3 rounded-xl relative group shadow-sm">
                               <div className="flex items-start gap-3">
                                   <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                       <i className="fas fa-file-import text-amber-600 text-sm"></i>
                                   </div>
                                   <div className="flex-grow min-w-0">
                                       <div className="text-sm font-bold text-gray-800 truncate" title={alert.fileName}>{alert.fileName}</div>
                                       <div className="text-xs text-gray-500 truncate" title={alert.path}>{alert.path}</div>
                                       <div className="text-xs text-gray-400 mt-1">{alert.timestamp.toLocaleTimeString()}</div>
                                   </div>
                               </div>
                               <div className="flex gap-2 mt-3">
                                   <button 
                                      onClick={() => onOpenLink(alert.path)}
                                      className="flex-1 bg-white border border-amber-200 text-xs py-1.5 rounded-lg hover:bg-amber-50 text-amber-700 font-medium transition-colors"
                                   >
                                       Open
                                   </button>
                                   <button 
                                      onClick={() => onDismissAlert(alert.id)}
                                      className="flex-1 bg-white border border-gray-200 text-xs py-1.5 rounded-lg hover:bg-gray-50 text-gray-600 font-medium transition-colors"
                                   >
                                       Dismiss
                                   </button>
                               </div>
                           </div>
                       ))}
                   </div>
               )}
           </div>

           {/* Config Section */}
           <div className="pt-4 border-t border-gray-200/50">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Monitored Folders</h3>
               <div className="space-y-2">
                   {watchedFolders.map(folder => (
                       <div key={folder.id} className="bg-white/60 p-3 rounded-xl border border-gray-200/60 shadow-sm backdrop-blur-sm">
                           {isEditMode ? (
                               <div className="flex flex-col gap-2">
                                   <input 
                                       value={folder.name}
                                       onChange={(e) => onEditWatcher(folder.id, 'name', e.target.value)}
                                       className="text-sm font-bold bg-white text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                       placeholder="Name"
                                   />
                                   <input 
                                       value={folder.path}
                                       onChange={(e) => onEditWatcher(folder.id, 'path', e.target.value)}
                                       className="text-xs text-gray-900 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                       placeholder="Path"
                                   />
                                   <button onClick={() => onRemoveWatcher(folder.id)} className="text-xs text-red-500 hover:text-red-700 text-left font-medium">Remove</button>
                               </div>
                           ) : (
                               <div className="flex items-center justify-between">
                                   <div>
                                       <div className="text-sm font-semibold text-gray-700">{folder.name}</div>
                                       <div className="text-xs text-gray-500 truncate max-w-[160px]" title={folder.path}>{folder.path}</div>
                                   </div>
                                   <div className="flex items-center gap-1.5">
                                        <div className="w-2 h-2 rounded-full bg-mint animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-emerald-600">ON</span>
                                   </div>
                               </div>
                           )}
                       </div>
                   ))}
                   {isEditMode && (
                       <button onClick={onAddWatcher} className="w-full py-2 border-2 border-dashed border-primary-light text-primary text-sm rounded-xl hover:bg-teal-50 transition-colors">
                           + Add Folder
                       </button>
                   )}
               </div>
           </div>

        </div>
      )}


      {/* --- MAIN TAB (Tools & Shortcuts) --- */}
      {(!collapsed && activeTab === 'main' || collapsed) && (
        <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col gap-6 pr-1">
          
          {/* Tools Section (Icons Grid) */}
          <div>
              {!collapsed && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Quick Tools</h3>}
              <div className={`grid gap-3 ${collapsed ? 'grid-cols-1' : 'grid-cols-4'}`}>
                  {tools.map((tool, index) => (
                      <div key={tool.id} className="relative group">
                          {isEditMode && !collapsed ? (
                              <div className="col-span-4 bg-white/80 p-3 rounded-xl border border-gray-200 mb-2 flex flex-col gap-2 shadow-sm backdrop-blur-sm">
                                  <div className="flex gap-2">
                                    <button onClick={() => onChangeToolIcon(index)} className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-white hover:border-primary transition-all">
                                        <i className={`fas ${tool.icon}`}></i>
                                    </button>
                                    <input 
                                        type="text" 
                                        value={tool.name}
                                        onChange={(e) => onEditTool(index, 'name', e.target.value)}
                                        className="flex-grow px-2 py-1 text-sm border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        placeholder="Name"
                                    />
                                    <button onClick={() => onDeleteTool(index)} className="text-red-400 px-1 hover:text-red-600"><i className="fas fa-trash"></i></button>
                                  </div>
                                  <input 
                                      type="text" 
                                      value={tool.link}
                                      onChange={(e) => onEditTool(index, 'link', e.target.value)}
                                      className="w-full px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                      placeholder="Executable Path"
                                  />
                              </div>
                          ) : (
                              <button 
                                  onClick={() => onOpenLink(tool.link)}
                                  className={`aspect-square w-full bg-gradient-to-br from-teal-50 to-white border border-primary-light text-primary rounded-xl flex items-center justify-center hover:shadow-md hover:shadow-teal-500/10 hover:border-accent hover:-translate-y-0.5 transition-all duration-200 ${isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={tool.name}
                                  disabled={isEditMode}
                              >
                                  <i className={`fas ${tool.icon} fa-lg drop-shadow-sm`}></i>
                              </button>
                          )}
                      </div>
                  ))}
                  {isEditMode && !collapsed && (
                      <button onClick={onAddTool} className="col-span-4 py-2 border-2 border-dashed border-primary-light text-primary text-sm rounded-xl hover:bg-teal-50 transition-colors">
                          + Add Tool
                      </button>
                  )}
              </div>
          </div>

          <hr className="border-primary-light/60" />

          {/* Shortcuts Section (List) */}
          <div>
              {!collapsed && <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-1">Shortcuts</h3>}
              <div className="space-y-3">
                {shortcuts.map((shortcut, index) => (
                  <div key={shortcut.id} className="group">
                    {isEditMode && !collapsed ? (
                      <div className="flex flex-col gap-2 p-3 border border-gray-200 rounded-xl bg-white/80 shadow-sm backdrop-blur-sm">
                        <div className="flex items-center gap-2">
                            <button 
                                onClick={() => onChangeShortcutIcon(index)}
                                className="p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-white text-gray-600"
                            >
                                <i className={`fas ${shortcut.icon}`}></i>
                            </button>
                            <input 
                                type="text" 
                                value={shortcut.name}
                                onChange={(e) => onEditShortcut(index, 'name', e.target.value)}
                                className="flex-grow p-1.5 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                placeholder="Name"
                            />
                            <button onClick={() => onDeleteShortcut(index)} className="text-gray-400 hover:text-danger">
                                <i className="fas fa-trash-alt"></i>
                            </button>
                        </div>
                        <input 
                            type="text" 
                            value={shortcut.link}
                            onChange={(e) => onEditShortcut(index, 'link', e.target.value)}
                            className="w-full p-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            placeholder="Path/URL"
                        />
                      </div>
                    ) : (
                      <button 
                        onClick={() => onOpenLink(shortcut.link)}
                        className={`w-full bg-white text-gray-700 border border-teal-50 rounded-xl p-2.5 font-medium hover:bg-teal-50 hover:border-primary-light hover:shadow-md hover:shadow-teal-200/20 hover:-translate-y-0.5 transition-all flex items-center group/btn ${collapsed ? 'justify-center' : 'px-3'}`}
                        title={collapsed ? shortcut.name : shortcut.link}
                      >
                        <span className={`w-8 h-8 rounded-lg bg-teal-50 text-primary flex items-center justify-center group-hover/btn:bg-primary/10 group-hover/btn:text-primary-dark transition-colors ${collapsed ? '' : 'mr-3'}`}>
                             <i className={`fas ${shortcut.icon}`}></i>
                        </span>
                        {!collapsed && <span className="truncate text-sm group-hover/btn:text-gray-900">{shortcut.name}</span>}
                      </button>
                    )}
                  </div>
                ))}
                
                {isEditMode && !collapsed && (
                  <button 
                    onClick={onAddShortcut}
                    className="w-full border-2 border-dashed border-primary-light text-primary text-sm rounded-xl p-2.5 font-medium hover:bg-teal-50 flex items-center justify-center transition-colors"
                  >
                    <i className="fas fa-plus mr-2"></i> Add Shortcut
                  </button>
                )}
              </div>
          </div>
        </div>
      )}

      {/* Footer Actions */}
      {!collapsed && (
          <div className="mt-auto space-y-1 pt-6 border-t border-primary-light/60">
            <button onClick={onImport} className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg flex items-center transition-colors">
                <i className="fas fa-file-import w-6 text-center text-primary"></i> Import Config
            </button>
            <button onClick={onExport} className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 hover:bg-white rounded-lg flex items-center transition-colors">
                <i className="fas fa-file-export w-6 text-center text-emerald-500"></i> Export Config
            </button>
          </div>
      )}
    </aside>
  );
};