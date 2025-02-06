// Task management and storage functionality
let tasks = [];
const STORAGE_KEY = 'taskManagerTasks';

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromStorage();
    renderTasks();
    updateStats();
    requestNotificationPermission();
});

// Request notification permission
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            console.log('Notification permission denied');
        }
    }
}

// Load tasks from local storage
function loadTasksFromStorage() {
    const storedTasks = localStorage.getItem(STORAGE_KEY);
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        // Reestablish notification timeouts for existing tasks
        tasks.forEach(task => {
            if (!task.completed) {
                setNotificationForTask(task);
            }
        });
    }
}

// Save tasks to local storage
function saveTasksToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Add new task
document.getElementById('taskForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskInput = document.getElementById('taskInput');
    const deadlineInput = document.getElementById('deadlineInput');
    
    const newTask = {
        id: Date.now(),
        text: taskInput.value,
        deadline: new Date(deadlineInput.value).getTime(),
        completed: false,
        notified: false
    };
    
    tasks.push(newTask);
    saveTasksToStorage();
    setNotificationForTask(newTask);
    
    taskInput.value = '';
    deadlineInput.value = '';
    
    renderTasks();
    updateStats();
});

// Set notification for a task
function setNotificationForTask(task) {
    if (!task.completed && !task.notified) {
        const reminderTime = parseInt(document.getElementById('reminderTime').value);
        const notificationTime = task.deadline - (reminderTime * 60 * 1000);
        
        if (notificationTime > Date.now()) {
            setTimeout(() => {
                sendNotification(task);
            }, notificationTime - Date.now());
        }
    }
}

// Send notification
function sendNotification(task) {
    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification('Task Reminder', {
            body: `Task "${task.text}" is due in ${document.getElementById('reminderTime').value} minutes!`,
            icon: '/favicon.ico'
        });
        
        // Mark task as notified
        const taskIndex = tasks.findIndex(t => t.id === task.id);
        if (taskIndex !== -1) {
            tasks[taskIndex].notified = true;
            saveTasksToStorage();
        }
    }
}

// Render tasks based on current filter
let currentFilter = 'all';

function renderTasks() {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';
    
    const filteredTasks = filterTasksList(tasks, currentFilter);
    
    filteredTasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'task-item';
        if (task.completed) li.classList.add('completed');
        
        const deadline = new Date(task.deadline);
        const isOverdue = !task.completed && deadline < new Date();
        if (isOverdue) li.classList.add('overdue');
        
        li.innerHTML = `
            <input type="checkbox" ${task.completed ? 'checked' : ''} 
                   onchange="toggleTask(${task.id})">
            <span class="task-text">${task.text}</span>
            <span class="deadline ${isOverdue ? 'overdue' : ''}">
                ${deadline.toLocaleString()}
            </span>
            <button onclick="deleteTask(${task.id})" class="delete-btn">Delete</button>
        `;
        
        taskList.appendChild(li);
    });
}

// Filter tasks
function filterTasks(filter) {
    currentFilter = filter;
    document.querySelectorAll('.filters button').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    renderTasks();
}

function filterTasksList(tasks, filter) {
    switch (filter) {
        case 'active':
            return tasks.filter(task => !task.completed);
        case 'completed':
            return tasks.filter(task => task.completed);
        case 'upcoming':
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return tasks.filter(task => 
                !task.completed && 
                new Date(task.deadline) >= today && 
                new Date(task.deadline) < tomorrow
            );
        default:
            return [...tasks];
    }
}

// Toggle task completion
function toggleTask(taskId) {
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        saveTasksToStorage();
        renderTasks();
        updateStats();
    }
}

// Delete task
function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToStorage();
    renderTasks();
    updateStats();
}

// Clear completed tasks
function clearCompleted() {
    tasks = tasks.filter(task => !task.completed);
    saveTasksToStorage();
    renderTasks();
    updateStats();
}

// Update statistics
function updateStats() {
    document.getElementById('totalTasks').textContent = tasks.length;
    document.getElementById('completedTasks').textContent = 
        tasks.filter(task => task.completed).length;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('upcomingTasks').textContent = 
        tasks.filter(task => 
            !task.completed && 
            new Date(task.deadline) >= today && 
            new Date(task.deadline) < tomorrow
        ).length;
}