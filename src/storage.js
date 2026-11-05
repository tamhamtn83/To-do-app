
export default class Storage {
    //get saved todo and create array if not
    static getTodos(){
       return JSON.parse(localStorage.getItem("todos")) || [];
        
    }
     static getProjects(projecdId){
       return JSON.parse(localStorage.getItem("projects")) || [];
     
    }
    
    static saveTodos(todo){
            const todos = this.getTodos();
            //push obj to array
            todos.push(todo);
            //save array to local storage!
            localStorage.setItem("todos", JSON.stringify(todos));
        }
    
    static saveProject(project){
        const projects = this.getProjects();
        //push obj to array
        projects.push(project);
        //save array to local storage!
        localStorage.setItem("projects", JSON.stringify(projects));
    }

    static generateIds(){
        const todos = this.getTodos()
        const id = todos.length === 0 ? 1 : Math.max(...todos.map(todo=>todo.id)) + 1;
        return id;
    }

    static generateProjectIds(){
        const projects = this.getProjects()
        const projectId = projects.length === 0 ? 1 : Math.max(...projects.map(project=>project.projectId)) + 1;
        return projectId;
    }

    static deleteTodos(id){
        const todos = this.getTodos()
        const updateTodos = todos.filter(todo=>todo.id!==id)
        localStorage.setItem("todos",JSON.stringify(updateTodos))
    }
    static deleteProjects(projectId){
        const projects = this.getProjects()
        const updateProjects = projects.filter(project=>project.projectId !== projectId)
        localStorage.setItem("projects",JSON.stringify(updateProjects))

        const todos = this.getTodos()
        const updateTodos = todos.filter(todo=>todo.projectId !== projectId)
        localStorage.setItem("todos",JSON.stringify(updateTodos))
    }
    static clear(){
        localStorage.clear();
    }

}
