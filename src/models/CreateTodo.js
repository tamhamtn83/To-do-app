export default class Todo{
    constructor(title,description,date,id, projectId ){
        this.title = title
        this.description = description
        this.date = date
        this.id = id
        this.complete = false
        this.projectId = projectId

    }
}
