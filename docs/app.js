let db = new PouchDB('todos');
let nextNumber = 1;
let nextOrder = 1;

function newTodo (text) {
  const matches = text.match(/^(x (\d\d\d\d-\d\d-\d\d) )?(\(([ABC])\) )?((\d\d\d\d-\d\d-\d\d) )?(.+)/);
  if (! matches) return;
  let [,,done,,pri,,open,desc] = matches;
  open = open || currentDate();
  done = done || false;
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

function pastDates() {
  const m = moment();
  return [3, 4, 7].map( d => m.subtract(d, "days").format(dateFormat) );
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
      numberOfCols: 4,
      allTodos: [],
      addTodoTextbox: '',
      searchMode: 'All',
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
          else if (this.editingField == 'open') this.editingTodo.open = cleanDateString(this.addTodoTextbox);
          else this.editingTodo.done = cleanDateString(this.addTodoTextbox);
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
        return 'btn btn-xs btn-' + (todo.done ? 'hidden' : todo.pri == 'A' ? 'danger' : todo.pri == 'B' ? 'primary' : 'c');
      },
      descClass: function(todo) {
        const today = currentDate();
        const [old1, old2, old3] = pastDates();
        return todo.done === today ? 'donetoday'
          : todo.done ? 'donepast'
          : todo.open > today ? 'future'
          : todo.open < old3 ? 'old3'
          : todo.open < old2 ? 'old2'
          : todo.open < old1 ? 'old1' 
          : '';
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
      searchBtnClass: function(mode) {
        return 'btn btn-block' + (mode === this.searchMode ? ' btn-info' : '');
      },
      clickSearchMode: function(mode) {
        this.searchMode = mode;
        this.search();
      },
      search: function() {
        const searchText = this.searchTextbox.toLowerCase();
        for (let todo of this.allTodos) {
          todo.matches = (this.searchMode == 'All' || (this.searchMode == 'Open' ? ! todo.done : !! todo.done)) 
            && todo.desc.toLowerCase().includes(searchText);
        }
        const openTodos = _.orderBy(this.matchingTodos.filter(t => ! t.done), ['open', 'number'], ['asc', 'asc', 'asc'])
        const closedTodos = _.orderBy(this.matchingTodos.filter(t => t.done), ['done', 'number'], ['desc', 'asc'])
        const todos = _.concat(openTodos, closedTodos);
        nextOrder = 1;
        for (let todo of todos) {
          todo.order = nextOrder++;
        }
      },
      editTodo: function(todo,field) {
        this.editingTodo = todo;
        this.editingField = field;
        if (field == 'desc') this.addTodoTextbox = todo.desc;
        else if (field == 'open') this.addTodoTextbox = todo.open;
        else this.addTodoTextbox = todo.done;
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
        this.importTextarea = _.orderBy(this.allTodos,['number'],['asc'])
          .filter( todo => todo.desc.length )
          .map( todo => {
            const done = todo.done ? `x ${todo.done} ` : '';
            const pri = todo.pri == 'A' || todo.pri == 'B' ? `(${todo.pri}) ` : '';
            return done + pri + todo.open + ' ' + todo.desc;
          }).join('\n');
        this.allTodos = [];
      },
    },
  });
  const calcNumberOfCols = () => vue.numberOfCols = Math.floor(document.body.clientWidth / 450);
  calcNumberOfCols();
  window.addEventListener("resize", calcNumberOfCols);
});

var dateFormat = 'YYYY-MM-DD';

// window.onbeforeunload = () => true;
// window.onbeforeunload = null;
