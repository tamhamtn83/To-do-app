import Storage from "./storage.js";
import Todo from "./models/CreateTodo.js";
import { format, isWithinInterval, startOfWeek, endOfWeek, weeksToDays, differenceInCalendarISOWeeks } from "date-fns";
import Project from "./models/CreateProject.js";


export function createUI() {
    const inbox = document.getElementById("inbox");
    const today = document.getElementById("today");
    const upcoming = document.getElementById("upcoming"); 
    const popup_container = document.getElementById
    ("popup-container");
    const main_header = document.getElementById("main-header");
    const main_content = document.getElementById("main-content");
    const add_task_div = document.getElementById("add-task-div");
    const add_project = document.getElementById("add-project");
    const add_task_button = document.getElementById("add-task");
    const add_project_button = document.getElementById("add-project");
    const project_popup_container = document.getElementById("project-popup-container");
    const menu_toggle = document.getElementById("menu-toggle");
    const sidebar_el = document.querySelector(".sidebar");
    const backdrop = document.getElementById("sidebar-backdrop");
    let currentFilter = "all";
    let currentProjectId = 0;

    function closeMobileSidebar() {
        if (sidebar_el) sidebar_el.classList.remove("open");
        if (backdrop) backdrop.classList.remove("active");
    }

    function toggleMobileSidebar() {
        if (sidebar_el) sidebar_el.classList.toggle("open");
        if (backdrop) backdrop.classList.toggle("active");
    }

    function setActiveNavItem(element) {
        const items = document.querySelectorAll(".nav-item");
        items.forEach(item => item.classList.remove("active"));
        if (element) {
            element.classList.add("active");
        }
    }

    //load sidebar!
    function sidebar(){
        setActiveNavItem(inbox);
    }

    //loadInbox
    function loadInbox(){
        currentFilter = "all"
        currentProjectId = 0
        setActiveNavItem(inbox);
        //create INBOX header and ADD_TASK BUTTON!
        loadTask_list(currentFilter);

        main_header.innerHTML = "<h1>Inbox</h1>";
    
        add_task_button.classList.remove("active")
        add_task_button.onclick = ()=>{
            createPopup(add_task_button);
        }
        closeMobileSidebar();
    }

    function loadProject(){
        createProjectPopup();
    }

    function createProjectPopup(){
        project_popup_container.innerHTML= `<input autocomplete="off" id="project-input-title" class="input task-title" placeholder="Project name?" style="margin-top: 10px;">
                <div class="popup-buttons-group">
                <button id="project-add-task-popup" class="button add-task-popup">Add</button>  
                <button id="project-cancel-task-popup" class="button cancel-task-popup">Cancel</button> 
                </div>`
    project_pop_up_toggle();
    createProject();
    }
    //Load POP-UP for adding task!!
    function createPopup(){
    //CREATE POPUP add-task
    popup_container.innerHTML= `<input autocomplete="off" id="input-title" class="input task-title" placeholder="what to do?">
                <input autocomplete="off"  type="text" class="input descr" id="input-description" placeholder="description?">
                <input type="date" class="input date" id="input-date">
                <div class="popup-buttons-group">
                <button id="add-task-popup" class="button add-task-popup">Add</button>  
                <button id="cancel-task-popup" class="button cancel-task-popup">Cancel</button> 
                </div>`
    create_todo();
    pop_up_toggle()
}   

    function pop_up_toggle(){
        const cancel = document.querySelector("#cancel-task-popup");
        openPopup();
        cancel.onclick = ()=>{
           closePopup();  
    }
        
    }
    function openPopup(){
        const popup = document.querySelector(".add-task-popup-container");
        if(currentFilter === "all" || currentFilter === "project"){
            add_task_button.classList.add("active")
        }
        popup.classList.add("active");
    }
    function closePopup(){
        const popup = document.querySelector(".add-task-popup-container");
        popup.classList.remove("active")
        if(currentFilter === "all" || currentFilter === "project"){
            add_task_button.classList.remove("active")
        }   
    }
    function openProjectPopup(){
        add_project_button.classList.add("active");
        project_popup_container.classList.add("active");
    }
    function closeProjectPopup(){
        project_popup_container.classList.remove("active")
        add_project_button.classList.remove("active")
    }
    function project_pop_up_toggle(){
        const cancel_project = document.getElementById("project-cancel-task-popup");
        openProjectPopup();
        cancel_project.onclick = ()=>{
           closeProjectPopup();  
    }
}

    function loadTask_list(filter = "all") {
        const todos = Storage.getTodos();
        const projects = Storage.getProjects();
        const task_list = document.getElementById("task-list");
        

        //get today date
        const today = format( new Date(), "yyyy-MM-dd" )

        //filter todos
        let filteredTodos = todos;
        //filter inbox: exclude todos from projects
        if(filter === "all"){
            filteredTodos = todos.filter(todo => !todo.projectId || todo.projectId === 0);
        }
        //filter todos that duedate are today!!
        else if(filter === "today"){
            filteredTodos = todos.filter(todo => todo.date === today);
        }
        //filter todos that duedate are this week!!
        else if(filter === "upcoming"){
            const week_start = startOfWeek(new Date(), {weekStartsOn: 1});
            const week_end = endOfWeek(new Date(), {weekStartsOn: 1});

            filteredTodos = todos.filter(todo => {
                if(!todo.date) return false;
                const dueDate = new Date(`${todo.date}T00:00:00`);

                return isWithinInterval(dueDate, {
                    start: week_start,
                    end: week_end
                });
            });
        }

        else if(filter === "project"){        
            filteredTodos = todos.filter(todo => todo.projectId === currentProjectId);
        }

        let html = "";

        filteredTodos.forEach((todo) => {
                const title = todo.title;
                const date = todo.date===""? "No due date": format(new Date(`${todo.date}T00:00:00`), "dd/MM/yyyy")
                const description = todo.description;
                const id = todo.id;

                let projectLabel = "";
                if ((filter === "today" || filter === "upcoming") && todo.projectId && todo.projectId !== 0) {
                    const project = projects.find(p => p.projectId === todo.projectId);
                    if (project) {
                        projectLabel = ` (${project.title})`;
                    }
                }

                html += `
                                <li data-id="${id}">
                                    <div class="unchecked">
                                        <i class="fa-regular fa-circle"></i>
                                    </div>
                                    <div class="task-detail">
                                        <div class="task-title">${title}${projectLabel}</div>
                                        <div class="task-description">${description}</div>
                                    </div>
                                    <div class="list-right">
                                        <div class="due-date">${date}
                                        </div>
                                        <div class="x-mark">
                                        <i class="fa-solid fa-xmark"></i>
                                        </div>
                                    </div>
                                </li>
                            `
        });

    task_list.innerHTML = html;
}
    function loadProjectList(){
        const projects = Storage.getProjects();
        const project_list = document.getElementById("project-list");

        let html = ""

        projects.forEach((project)=>{
            const title = project.title
            const projectId = project.projectId

            html += `
            <button class="button project-button nav-item" data-id="${projectId}">
                <div>
                        <i class="fa-solid fa-list-ul" style="margin-right: 5px;"></i>
                        ${title}
                </div>
                        <div class="project-x-mark">
                        <i class="fa-solid fa-xmark"></i>
                        </div>
                    </button>
                    
                    `
                    
        })
    
        project_list.innerHTML = html;
        if (currentFilter === "project") {
            const activeProjectBtn = project_list.querySelector(`[data-id="${currentProjectId}"]`);
            if (activeProjectBtn) {
                setActiveNavItem(activeProjectBtn);
            }
        }
    }

    function loadProjectHeader(){
        const projects = Storage.getProjects();
        const project_selected = projects.find(project=>project.projectId === currentProjectId)
        if(!project_selected){
            return;
        }
        let html=""
        const title = project_selected.title
        html = `<h1>${title}</h1>`
        main_header.innerHTML = html

    }


    //create todo object!
    function create_todo(){
        const add_task_popup = document.getElementById("add-task-popup");
        add_task_popup.onclick = ()=>{
            const title = document.getElementById("input-title").value;
            const description = document.getElementById("input-description").value;
            const date = document.getElementById("input-date").value;
            if(!title.trim()){
                alert("please provide task name");
                return false;
            }
            else{
              const id = Storage.generateIds();
              const projectId = currentProjectId;
              const todo = new Todo(title,description,date,id,projectId);
              Storage.saveTodos(todo); 
              closePopup();
              loadTask_list(currentFilter);
            }       
        }
    }
    function createProject(){
        const project_add_popup = document.getElementById("project-add-task-popup");
        project_add_popup.onclick = ()=>{
            const title = document.getElementById("project-input-title").value;
            if(!title.trim()){
                alert("please provide project name");
                return false;
            }
            else{
                const projectId = Storage.generateProjectIds();
                const project = new Project(title,projectId);
                Storage.saveProject(project);
                closeProjectPopup();
                loadProjectList();
            }
        }

    }
    function clear_html(){
        main_header.innerHTML = ""
        const task_list = document.getElementById("task-list");
        task_list.innerHTML = "";
        
    }

    function deleteTodos(){
        const task_list = document.getElementById("task-list");
        task_list.addEventListener("click", (event) => {
        
        const target = event.target.closest(".x-mark, .unchecked");


        if (!target) return;

        const todo_item = target.closest("li") 
        const id = Number(todo_item.dataset.id);

        Storage.deleteTodos(id);
        loadTask_list(currentFilter);
            });
    }

    function deleteProjects(){
       const project_list = document.getElementById("project-list")
       project_list.addEventListener("click", (event)=>{

        const x_mark = event.target.closest(".project-x-mark")

        if(!x_mark) return;
        event.stopPropagation();

        const project_item = x_mark.closest("button");
        const projectId = Number(project_item.dataset.id);

        Storage.deleteProjects(projectId);
        loadProjectList();

        if (currentProjectId === projectId) {
            loadInbox();
        } else {
            loadTask_list(currentFilter);
        }
       })
    }

    function loadToday(){
        currentProjectId = 0
        currentFilter = "today"
        setActiveNavItem(today);
        const add_task = document.getElementById("add-task")
        main_header.innerHTML = "<h1>Today</h1>";
        add_task.classList.add("active");
        loadTask_list(currentFilter);
        closeMobileSidebar();
    }

    function loadUpcoming(){
        currentProjectId = 0
        currentFilter = "upcoming"
        setActiveNavItem(upcoming);
        main_header.innerHTML = "<h1>Upcoming</h1>"
        const add_task = document.getElementById("add-task")
        add_task.classList.add("active");
        loadTask_list(currentFilter);
        closeMobileSidebar();
    }

    function DOMlogic(){
        inbox.addEventListener("click", loadInbox);
        today.addEventListener("click", loadToday);
        upcoming.addEventListener("click", loadUpcoming);
        add_project.addEventListener("click", loadProject);
        if (menu_toggle) {
            menu_toggle.addEventListener("click", toggleMobileSidebar);
        }
        if (backdrop) {
            backdrop.addEventListener("click", closeMobileSidebar);
        }
    }

    function selectProject(){
        const project_list = document.getElementById("project-list")
        project_list.addEventListener("click", (event)=>{
            if (event.target.closest(".project-x-mark")) return;

            const project = event.target.closest(".project-button")

            if(!project) return;
            
            currentProjectId = Number(project.dataset.id)
            currentFilter = "project"
            setActiveNavItem(project);
            loadProjectHeader();
            add_task_button.classList.remove("active");
            add_task_button.onclick = ()=>{
                createPopup(add_task_button);
            }
            loadTask_list(currentFilter)
            closeMobileSidebar();
        })
    }
    function render(){
    loadInbox();
    loadTask_list("all");
    deleteTodos();
    loadProjectList();
    DOMlogic();
    deleteProjects();
    selectProject();
    sidebar();
}
    return {render};
}