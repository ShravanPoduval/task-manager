let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
    renderTasks();
    updateCounters();
});

document.getElementById('taskInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

function addTask() {
    const input = document.getElementById('taskInput');
    const taskText = input.value.trim();
    
    if (taskText) {
        const task = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date()
        };
        
        tasks.push(task);
        saveTasks();
        input.value = '';
        renderTasks();
        updateCounters();
    }
}

function toggleTask(id) {
    tasks = tasks.map(task => {
        if (task.id === id) {
            return { ...task, completed: !task.completed };
        }
        return task;
    });
    
    saveTasks();
    renderTasks();
    updateCounters();
}

function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
    updateCounters();
}

function filterTasks(filter) {
    currentFilter = filter;
    
    // Update active state of filter buttons
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === filter) {
            btn.classList.add('active');
        }
    });
    
    renderTasks();
}

function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks();
    updateCounters();
}

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    let filteredTasks = tasks;
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    filteredTasks.sort((a, b) => b.createdAt - a.createdAt);
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = task.completed ? 'completed' : '';
        
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                onchange="toggleTask(${task.id})">
            <span>${task.text}</span>
            <button onclick="deleteTask(${task.id})">Delete</button>
        `;
        
        taskList.appendChild(li);
    });
}

function updateCounters() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = 
        tasks.filter(task => task.completed).length;
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}