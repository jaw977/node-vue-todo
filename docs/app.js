let db = new PouchDB('todos');
let nextNumber = 1;
let nextOrder = 1;

function newTodo (text) {
  const matches = text.match(/^(x (\d\d\d\d-\d\d-\d\d) )?(\(([ABC])\) )?((\d\d\d\d-\d\d-\d\d) )?(.+)/);
  if (! matches) return;
  let [,,done,,pri,,open,desc] = matches;
  open = open || currentDate();
  pri = pri || 'C';
  const number = nextNumber++;
  const todo = { desc, number, open, pri, done };
  db.post(todo).then( response => {
    todo._id = response.id;
    todo._rev = response.rev 
  });
  todo.matches = true;
  todo.order = nextOrder++;
  return todo;
}

function saveTodo (fullTodo) {
  const { matches, order, ...todo } = fullTodo;
  db.put(todo).then( response => {
    fullTodo._rev = response.rev; 
  });
}

function currentDate() {
  return moment().format(dateFormat);
}


function cleanDateString(str) {
  let matches = str.match(/^(\d\d?)[/-](\d\d?)$/);
  if (matches) {
    const now = moment();
    const [, month, date] = matches.map(s => s.padStart(2,'0'));
    str = `${now.year()}-${month}-${date}`;
  }
  return str;
}

window.addEventListener('load', function () {
  var vue = new Vue({
    el: '#app',
    data: {
      numberOfCols: 3,
      allTodos: [],
      addTodoTextbox: '',
      searchMode: 'Open',
      searchTextbox: '',
      editingTodo: false,
      editingField: false,
      mode: false, //'import',
      importTextarea: '',
    },
    mounted: function () {
      db.allDocs({include_docs: true}).then( result => {
        const numbers = [];
        result.rows.forEach( row => {
          row.doc.matches = row.doc.order = false;
          numbers.push(row.doc.number);
          this.allTodos.push(row.doc);
        });
        nextNumber = _.max(numbers) + 1;
        this.search();
      });
    },
    computed: {
      matchingTodos: function() {
        return _.orderBy(this.allTodos.filter( t => t.desc && t.matches ), ['order'], ['asc']);
      },
      chunkedTodos: function() {
        return _.chunk(this.matchingTodos, this.numberOfCols);
      },
    },
    methods: {
      addTodo: function(event) {
        if (event.keyCode != 13) return;
        if (this.editingTodo) { 
          if (this.editingField == 'desc') {
            this.editingTodo.desc = this.addTodoTextbox;
            if (! this.addTodoTextbox) this.editingTodo._deleted = true;
          }
          else this.editingTodo.open = cleanDateString(this.addTodoTextbox);
          saveTodo(this.editingTodo);
        }
        else {
          const todo = newTodo(this.addTodoTextbox);
          if (todo) this.allTodos.push(todo);
        }
        this.editingTodo = false;
        this.addTodoTextbox = '';
      },
      todoDoneClass: function(todo) {
        return 'glyphicon glyphicon-' + (todo.done ? 'check' : 'unchecked');
      },
      priClass: function(todo) {
        return 'btn btn-xs' + (todo.pri == 'A' ? ' btn-danger' : todo.pri == 'B' ? ' btn-primary' : '') + (todo.done ? ' disabled' : '');
      },
      descClass: function(todo) {
        return todo.done ? 'done' : todo.open > currentDate() ? 'future' : '';
      },
      toggleDone: function(todo) {
        todo.done = todo.done ? false : currentDate();
        if (! todo.done) todo.open = currentDate();
        saveTodo(todo);
      },
      clickPri: function(todo) {
        if (todo.done) return;
        todo.pri = todo.pri == 'A' ? 'C' : todo.pri == 'B' ? 'A' : 'B';
        saveTodo(todo);
      },
      clickSearchMode: function() {
        this.searchMode = this.searchMode == 'Open' ? 'Done' : 'Open';
        this.search();
      },
      search: function() {
        const searchText = this.searchTextbox.toLowerCase();
        for (let todo of this.allTodos) {
          todo.matches = (this.searchMode == 'Open' ? ! todo.done : !! todo.done) && todo.desc.toLowerCase().includes(searchText);
        }
        const todos = this.searchMode == 'Open'
          ? _.orderBy(this.matchingTodos, ['pri', 'open', 'number'], ['asc', 'asc', 'asc'])
          : _.orderBy(this.matchingTodos, ['close', 'number'], ['desc', 'asc']);
        nextOrder = 1;
        for (let todo of todos) {
          todo.order = nextOrder++;
        }
      },
      editTodo: function(todo,field) {
        this.editingTodo = todo;
        this.editingField = field;
        if (field == 'desc') this.addTodoTextbox = todo.desc;
        else this.addTodoTextbox = todo.open;
        this.$refs.addTodoTextbox.focus();
      },
      dupTodo: function(todo) {
        this.editingTodo = false;
        this.addTodoTextbox = todo.desc;
        this.$refs.addTodoTextbox.focus();
      },
      shortDate: function(str) {
        return str ? str.replace(/(\d\d\d\d)-(\d\d)-(\d\d)/,'$2/$3') : '';
      },
      importTodos: function() {
        db.destroy().then( () => {
          db = new PouchDB('todos');
          nextNumber = 1;
          for (let line of this.importTextarea.split("\n")) {
            const todo = newTodo(line);
            if (todo) this.allTodos.push(todo);
          }
          this.search();
          this.mode = false;
        });
      },
      exportTodos: function() {
        this.mode = 'import';
        this.importTextarea = _.orderBy(this.allTodos,['number'],['asc']).map( todo => {
          const done = todo.done ? `x ${todo.done} ` : '';
          const pri = todo.pri == 'A' || todo.pri == 'B' ? `(${todo.pri}) ` : '';
          return done + pri + todo.open + ' ' + todo.desc;
        }).join('\n');
        this.allTodos = [];
      },
    },
  });
});

var dateFormat = 'YYYY-MM-DD';

// window.onbeforeunload = () => true;
// window.onbeforeunload = null;
