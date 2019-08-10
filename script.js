class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
    // this.todos = [
    //   { id: 1, text: 'Run a marathon', complete: false },
    //   { id: 2, text: 'Plant a garden', complete: false },
    // ]
  }

  bindEvents(controller) {
    this.onTodoListChanged = controller.onTodoListChanged
  }

  update() {
    localStorage.setItem('todos', JSON.stringify(this.todos))
  }

  addTodo(todo) {
    this.todos = [...this.todos, todo]
    this.update()

    this.onTodoListChanged(this.todos)
  }

  editTodo(id, updatedText) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
    )
    this.update()
  }

  deleteTodo(id) {
    this.todos = this.todos.filter(todo => todo.id !== id)
    this.update()

    this.onTodoListChanged(this.todos)
  }

  toggleTodo(id) {
    this.todos = this.todos.map(todo =>
      todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete} : todo
    )
    this.update()
  }
}

class View {
  constructor() {
    this.app = this.getElement('#root')

    this.title = this.createElement('h1')
    this.title.textContent = 'Todos'

    this.form = this.createElement('form')

    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add todo'
    this.input.name = 'todo'

    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Submit'

    this.todoList = this.createElement('ul', 'todo-list')

    this.form.append(this.input, this.submitButton)

    this.app.append(this.title, this.form, this.todoList)
  }

  bindEvents(controller) {
    this.form.addEventListener('submit', controller.handleAddTodo)
    this.todoList.addEventListener('click', controller.handleDeleteTodo)
    this.todoList.addEventListener('input', controller.handleEditTodo)
    this.todoList.addEventListener('focusout', controller.handleEditTodoComplete)
    this.todoList.addEventListener('change', controller.handleToggle)
  }

  get todoText() {
    return this.input.value
  }

  resetInput() {
    this.input.value = ''
  }

  createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) element.classList.add(className)

    return element
  }

  getElement(selector) {
    return document.querySelector(selector)
  }

  displayTodos(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    if (todos.length === 0) {
      const p = this.createElement('p')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      // Create todo item nodes for each todo in state
      todos.forEach(todo => {
        const li = this.createElement('li')
        li.id = todo.id

        // Each todo item will have a checkbox you can toggle
        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = todo.complete

        // The todo item text will be in a contenteditable span
        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        // The todo item is complete, it will have a strikethrough
        if (todo.complete) {
          const strike = this.createElement('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          // Otherwise just display the text
          span.textContent = todo.text
        }

        // The todos will also have a delete button
        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = 'Delete'
        li.append(checkbox, span, deleteButton)

        this.todoList.append(li)
      })
    }
  }
}

class Controller {
  temporaryEditValue = ''

  constructor(model, view) {
    this.model = model
    this.view = view

    this.onTodoListChanged(this.model.todos)

    this.view.bindEvents(this)
    this.model.bindEvents(this)
  }

  onTodoListChanged = todos => {
    this.view.displayTodos(todos)
  }

  handleAddTodo = event => {
    event.preventDefault()
    if (this.view.todoText === '') return

    const todo = {
      id: this.model.todos.length > 0 ? this.model.todos[this.model.todos.length - 1].id + 1 : 1,
      text: this.view.todoText,
      complete: false,
    }

    this.model.addTodo(todo)
    this.view.resetInput()
  }

  handleEditTodo = event => {
    if (!event.target.className === 'editable') return

    this.temporaryEditValue = event.target.innerText
  }

  handleEditTodoComplete = event => {
    if (!temporaryEditValue) return

    const id = parseInt(event.target.parentElement.id)
    this.model.editTodo(id, this.temporaryEditValue)
    this.temporaryEditValue = ''
  }

  handleDeleteTodo = event => {
    if (!event.target.className === 'delete') return

    const id = parseInt(event.target.parentElement.id)
    this.model.deleteTodo(id)
  }

  handleToggle = event => {
    if (!event.target.type === 'checkbox') return

    const id = parseInt(event.target.parentElement.id)
    this.model.toggleTodo(id)
  }
}

const app = new Controller(new Model(), new View())
