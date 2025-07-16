import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Check, 
  Calendar, 
  Flag, 
  Inbox, 
  Star, 
  Filter,
  Search,
  MoreHorizontal,
  X,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  Circle,
  CheckCircle2
} from 'lucide-react';

const TodoistClone = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([
    { id: 'inbox', name: 'Inbox', color: '#246fe0', isDefault: true },
    { id: 'work', name: 'Work', color: '#db4035', isDefault: false },
    { id: 'personal', name: 'Personal', color: '#ff9933', isDefault: false }
  ]);
  const [labels, setLabels] = useState([
    { id: 'urgent', name: 'urgent', color: '#d1453b' },
    { id: 'calls', name: 'calls', color: '#246fe0' },
    { id: 'waiting', name: 'waiting', color: '#ff9933' },
    { id: 'home', name: 'home', color: '#7ecc49' }
  ]);
  const [filters, setFilters] = useState([
    { id: 'priority1', name: 'High Priority', query: 'priority:1' },
    { id: 'overdue', name: 'Overdue', query: 'overdue' },
    { id: 'no-date', name: 'No Date', query: 'no date' }
  ]);
  const [selectedProject, setSelectedProject] = useState('inbox');
  const [selectedView, setSelectedView] = useState('today');
  const [newTask, setNewTask] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddProject, setShowAddProject] = useState(false);
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [showAddFilter, setShowAddFilter] = useState(false);
  const [newProject, setNewProject] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newFilter, setNewFilter] = useState({ name: '', query: '' });
  const [editingTask, setEditingTask] = useState(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [showLabelSelector, setShowLabelSelector] = useState(null);

  // Priority colors
  const priorityColors = {
    1: '#d1453b',
    2: '#eb8909',
    3: '#246fe0',
    4: '#666666'
  };

  // Add sample tasks on mount
  useEffect(() => {
    const sampleTasks = [
      {
        id: Date.now() + 1,
        text: 'Review project proposal',
        completed: false,
        project: 'work',
        labels: ['urgent', 'calls'],
        priority: 2,
        dueDate: new Date().toISOString().split('T')[0],
        createdAt: new Date()
      },
      {
        id: Date.now() + 2,
        text: 'Buy groceries',
        completed: false,
        project: 'personal',
        labels: ['home'],
        priority: 3,
        dueDate: null,
        createdAt: new Date()
      },
      {
        id: Date.now() + 3,
        text: 'Complete quarterly report',
        completed: true,
        project: 'work',
        labels: ['urgent'],
        priority: 1,
        dueDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        createdAt: new Date()
      }
    ];
    setTasks(sampleTasks);
  }, []);

  const addTask = () => {
    if (newTask.trim()) {
      const task = {
        id: Date.now(),
        text: newTask.trim(),
        completed: false,
        project: selectedProject === 'today' || selectedProject === 'upcoming' ? 'inbox' : selectedProject,
        labels: [],
        priority: 4,
        dueDate: selectedView === 'today' ? new Date().toISOString().split('T')[0] : null,
        createdAt: new Date()
      };
      setTasks([...tasks, task]);
      setNewTask('');
    }
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    setEditingTask(null);
  };

  const addLabel = () => {
    if (newLabel.trim()) {
      const label = {
        id: Date.now().toString(),
        name: newLabel.trim().toLowerCase(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16)
      };
      setLabels([...labels, label]);
      setNewLabel('');
      setShowAddLabel(false);
    }
  };

  const addFilter = () => {
    if (newFilter.name.trim() && newFilter.query.trim()) {
      const filter = {
        id: Date.now().toString(),
        name: newFilter.name.trim(),
        query: newFilter.query.trim()
      };
      setFilters([...filters, filter]);
      setNewFilter({ name: '', query: '' });
      setShowAddFilter(false);
    }
  };

  const toggleTaskLabel = (taskId, labelId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const hasLabel = task.labels.includes(labelId);
        return {
          ...task,
          labels: hasLabel 
            ? task.labels.filter(id => id !== labelId)
            : [...task.labels, labelId]
        };
      }
      return task;
    }));
  };

  const parseFilterQuery = (query) => {
    const conditions = [];
    
    if (query.includes('priority:1')) conditions.push(task => task.priority === 1);
    if (query.includes('priority:2')) conditions.push(task => task.priority === 2);
    if (query.includes('priority:3')) conditions.push(task => task.priority === 3);
    if (query.includes('priority:4')) conditions.push(task => task.priority === 4);
    
    if (query.includes('overdue')) {
      conditions.push(task => {
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate && task.dueDate < today && !task.completed;
      });
    }
    
    if (query.includes('no date')) {
      conditions.push(task => !task.dueDate);
    }
    
    if (query.includes('today')) {
      conditions.push(task => {
        const today = new Date().toISOString().split('T')[0];
        return task.dueDate === today;
      });
    }
    
    // Check for label queries (@labelname)
    const labelMatches = query.match(/@(\w+)/g);
    if (labelMatches) {
      labelMatches.forEach(match => {
        const labelName = match.substring(1);
        conditions.push(task => task.labels.some(labelId => {
          const label = labels.find(l => l.id === labelId);
          return label && label.name === labelName;
        }));
      });
    }
    
    // Check for project queries (#projectname)
    const projectMatches = query.match(/#(\w+)/g);
    if (projectMatches) {
      projectMatches.forEach(match => {
        const projectName = match.substring(1);
        conditions.push(task => {
          const project = projects.find(p => p.id === task.project);
          return project && project.name.toLowerCase() === projectName.toLowerCase();
        });
      });
    }
    
    return conditions;
  };

  const addProject = () => {
    if (newProject.trim()) {
      const project = {
        id: Date.now().toString(),
        name: newProject.trim(),
        color: '#' + Math.floor(Math.random()*16777215).toString(16),
        isDefault: false
      };
      setProjects([...projects, project]);
      setNewProject('');
      setShowAddProject(false);
    }
  };

  const getFilteredTasks = () => {
    let filtered = tasks;

    // Apply custom filter if selected
    if (selectedView.startsWith('filter:')) {
      const filterId = selectedView.substring(7);
      const filter = filters.find(f => f.id === filterId);
      if (filter) {
        const conditions = parseFilterQuery(filter.query);
        filtered = filtered.filter(task => 
          conditions.every(condition => condition(task))
        );
      }
    } else {
      // Filter by search query
      if (searchQuery) {
        filtered = filtered.filter(task => 
          task.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.labels.some(labelId => {
            const label = labels.find(l => l.id === labelId);
            return label && label.name.toLowerCase().includes(searchQuery.toLowerCase());
          })
        );
      }

      // Filter by view
      switch (selectedView) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          filtered = filtered.filter(task => 
            task.dueDate === today || (task.dueDate && task.dueDate < today && !task.completed)
          );
          break;
        case 'upcoming':
          const todayDate = new Date().toISOString().split('T')[0];
          filtered = filtered.filter(task => 
            task.dueDate && task.dueDate > todayDate
          );
          break;
        default:
          if (selectedView !== 'inbox' && !selectedView.startsWith('label:')) {
            filtered = filtered.filter(task => task.project === selectedView);
          } else if (selectedView.startsWith('label:')) {
            const labelId = selectedView.substring(6);
            filtered = filtered.filter(task => task.labels.includes(labelId));
          }
      }
    }

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(task => !task.completed);
    }

    return filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed - b.completed;
      return a.priority - b.priority;
    });
  };

  const getTaskCount = (view) => {
    return tasks.filter(task => {
      if (task.completed) return false;
      
      if (view.startsWith('filter:')) {
        const filterId = view.substring(7);
        const filter = filters.find(f => f.id === filterId);
        if (filter) {
          const conditions = parseFilterQuery(filter.query);
          return conditions.every(condition => condition(task));
        }
        return false;
      }
      
      if (view.startsWith('label:')) {
        const labelId = view.substring(6);
        return task.labels.includes(labelId);
      }
      
      switch (view) {
        case 'today':
          const today = new Date().toISOString().split('T')[0];
          return task.dueDate === today || (task.dueDate && task.dueDate < today);
        case 'upcoming':
          const todayDate = new Date().toISOString().split('T')[0];
          return task.dueDate && task.dueDate > todayDate;
        default:
          return task.project === view;
      }
    }).length;
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const TaskItem = ({ task }) => (
    <div className={`group relative flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 ${task.completed ? 'opacity-60' : ''}`}>
      <button
        onClick={() => toggleTask(task.id)}
        className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed 
            ? 'bg-green-500 border-green-500 text-white' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {task.completed && <Check className="w-3 h-3" />}
      </button>
      
      <div className="flex-1 min-w-0">
        {editingTask === task.id ? (
          <div>
            <input
              name="text"
              defaultValue={task.text}
              className="w-full px-2 py-1 border rounded"
              autoFocus
              onBlur={() => setEditingTask(null)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  updateTask(task.id, { text: e.target.value });
                }
              }}
            />
          </div>
        ) : (
          <span className={`${task.completed ? 'line-through text-gray-500' : ''}`}>
            {task.text}
          </span>
          
          {/* Task Labels */}
          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {task.labels.map(labelId => {
                const label = labels.find(l => l.id === labelId);
                return label ? (
                  <span
                    key={labelId}
                    className="text-xs px-2 py-1 rounded-full text-white"
                    style={{ backgroundColor: label.color }}
                  >
                    @{label.name}
                  </span>
                ) : null;
              })}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2 mt-1">
          {task.dueDate && (
            <span className={`text-xs px-2 py-1 rounded ${
              task.dueDate < new Date().toISOString().split('T')[0] && !task.completed
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Calendar className="w-3 h-3 inline mr-1" />
              {formatDate(task.dueDate)}
            </span>
          )}
          
          {task.priority < 4 && (
            <Flag 
              className="w-3 h-3" 
              style={{ color: priorityColors[task.priority] }}
              fill={priorityColors[task.priority]}
            />
          )}
          
          <span className="text-xs text-gray-500">
            {projects.find(p => p.id === task.project)?.name || 'Inbox'}
          </span>
        </div>
      </div>
      
      <div className="opacity-0 group-hover:opacity-100 flex gap-1">
        <button
          onClick={() => setShowLabelSelector(showLabelSelector === task.id ? null : task.id)}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add labels"
        >
          <span className="text-xs">@</span>
        </button>
        <button
          onClick={() => setEditingTask(task.id)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => deleteTask(task.id)}
          className="p-1 hover:bg-gray-200 rounded text-red-500"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Label Selector Dropdown */}
      {showLabelSelector === task.id && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-48">
          <div className="p-2 text-sm text-gray-600 border-b">Add labels:</div>
          <div className="max-h-40 overflow-y-auto">
            {labels.map(label => (
              <button
                key={label.id}
                onClick={() => toggleTaskLabel(task.id, label.id)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 ${
                  task.labels.includes(label.id) ? 'bg-blue-50' : ''
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: label.color }}
                />
                <span>@{label.name}</span>
                {task.labels.includes(label.id) && (
                  <Check className="w-4 h-4 ml-auto text-blue-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const filteredTasks = getFilteredTasks();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* Views */}
            <div className="mb-4">
              <button
                onClick={() => setSelectedView('today')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                  selectedView === 'today' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Today</span>
                <span className="ml-auto text-sm text-gray-500">
                  {getTaskCount('today')}
                </span>
              </button>
              
              <button
                onClick={() => setSelectedView('upcoming')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                  selectedView === 'upcoming' ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Upcoming</span>
                <span className="ml-auto text-sm text-gray-500">
                  {getTaskCount('upcoming')}
                </span>
              </button>
            </div>
            
            {/* Labels */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Labels</h3>
                <button
                  onClick={() => setShowAddLabel(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {labels.map(label => (
                <button
                  key={label.id}
                  onClick={() => setSelectedView(`label:${label.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                    selectedView === `label:${label.id}` ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: label.color }}
                  />
                  <span>@{label.name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {getTaskCount(`label:${label.id}`)}
                  </span>
                </button>
              ))}
              
              {showAddLabel && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Label name"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addLabel();
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={addLabel}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddLabel(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Filters */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Filters</h3>
                <button
                  onClick={() => setShowAddFilter(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {filters.map(filter => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedView(`filter:${filter.id}`)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                    selectedView === `filter:${filter.id}` ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <Filter className="w-4 h-4" />
                  <span>{filter.name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {getTaskCount(`filter:${filter.id}`)}
                  </span>
                </button>
              ))}
              
              {showAddFilter && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Filter name"
                    value={newFilter.name}
                    onChange={(e) => setNewFilter({...newFilter, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm mb-2"
                    autoFocus
                  />
                  <input
                    type="text"
                    placeholder="Query (e.g., priority:1 @urgent)"
                    value={newFilter.query}
                    onChange={(e) => setNewFilter({...newFilter, query: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Examples: priority:1, @urgent, #work, overdue, today, no date
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={addFilter}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddFilter(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Projects */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-700">Projects</h3>
                <button
                  onClick={() => setShowAddProject(true)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedView(project.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-gray-100 ${
                    selectedView === project.id ? 'bg-blue-50 text-blue-600' : ''
                  }`}
                >
                  <div 
                    className="w-2 h-2 rounded-full" 
                    style={{ backgroundColor: project.color }}
                  />
                  <span>{project.name}</span>
                  <span className="ml-auto text-sm text-gray-500">
                    {getTaskCount(project.id)}
                  </span>
                </button>
              ))}
              
              {showAddProject && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Project name"
                    value={newProject}
                    onChange={(e) => setNewProject(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        addProject();
                      }
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={addProject}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddProject(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {selectedView === 'today' ? 'Today' : 
               selectedView === 'upcoming' ? 'Upcoming' : 
               selectedView.startsWith('label:') ? `@${labels.find(l => l.id === selectedView.substring(6))?.name || 'Label'}` :
               selectedView.startsWith('filter:') ? filters.find(f => f.id === selectedView.substring(7))?.name || 'Filter' :
               projects.find(p => p.id === selectedView)?.name || 'Inbox'}
            </h1>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className={`px-3 py-1 rounded text-sm ${
                  showCompleted ? 'bg-gray-200 text-gray-700' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {showCompleted ? 'Hide completed' : 'Show completed'}
              </button>
              <button className="p-2 hover:bg-gray-100 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addTask();
                }
              }}
            />
            <button
              type="button"
              onClick={addTask}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                {searchQuery ? 'No tasks found' : 'No tasks yet. Add one above!'}
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredTasks.map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoistClone;