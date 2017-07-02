function newTodo (text) {
	const matches = text.match(/^(x (\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d) )?(\(([ABC])\) )?(\d\d\d\d-\d\d-\d\d( \d\d:\d\d:\d\d)? )?(.+)/);
	if (! matches) return;
	let [,,done,,pri,open,,desc] = matches;
	open = open ? stringToMs(open) : Date.now();
	pri = pri || 'C';
	done = done && stringToMs(done);
	return { desc, open, pri, done, matches:true, order:pri };
}

function msToString(ms) {
	return moment(ms).format(dateTimeFormat);
}

function stringToMs(str) {
	return +moment(str, dateTimeFormat);
}

window.addEventListener('load', function () {
	var vue = new Vue({
		el: '#app',
		data: {
			numberOfCols: 3,
			allTodos: [],
			addTodoTextbox: '',
			searchMode: 'Open',
			searchText: '',
			editingTodo: false,
			editingField: false,
			mode: 'import',
			importTextarea: '',
		},
		computed: {
			matchingTodos: function() {
				return _.sortBy(this.allTodos.filter( t => t.matches ), 'order');
			},
			chunkedTodos: function() {
				return _.chunk(this.matchingTodos, this.numberOfCols);
			},
		},
		methods: {
			addTodo: function(event) {
				if (event.keyCode != 13) return;
				if (this.editingTodo) { 
					if (this.editingField == 'desc') this.editingTodo.desc = this.addTodoTextbox;
					else this.editingTodo.open = stringToMs(this.addTodoTextbox);
				}
				else this.allTodos.push(newTodo(this.addTodoTextbox));
				this.editingTodo = false;
				this.addTodoTextbox = '';
			},
			todoDoneClass: function(todo) {
				return 'glyphicon glyphicon-' + (todo.done ? 'check' : 'unchecked');
			},
			priClass: function(todo) {
				return 'btn btn-xs' + (todo.pri == 'A' ? ' btn-danger' : todo.pri == 'B' ? ' btn-primary' : '');
			},
			descClass: function(todo) {
				return todo.open > Date.now() ? 'future' : '';
			},
			toggleDone: function(todo) {
				todo.done = todo.done ? false : Date.now();
			},
			clickPri: function(todo) {
				todo.pri = todo.pri == 'A' ? 'C' : todo.pri == 'B' ? 'A' : 'B';
			},
			clickSearchMode: function() {
				this.searchMode = this.searchMode == 'Open' ? 'Done' : 'Open';
				this.search();
			},
			search: function() {
				for (let todo of this.allTodos) {
					todo.matches = this.searchMode == 'Open' ? ! todo.done : todo.done;
					todo.order = this.searchMode == 'Open' ? ((todo.pri == 'A' ? 1 : todo.pri == 'B' ? 2 : 3) * todo.open) : -todo.done;
				}
			},
			editTodo: function(todo,field) {
				this.editingTodo = todo;
				this.editingField = field;
				if (field == 'desc') this.addTodoTextbox = todo.desc;
				else this.addTodoTextbox = msToString(todo.open);
				this.$refs.addTodoTextbox.focus();
			},
			shortDate: function(ms) {
				var d = new Date(ms);
				return '' + (d.getMonth() + 1) + '/' + d.getDate();
			},
			importTodos: function() {
				for (let line of this.importTextarea.split("\n")) {
					const todo = newTodo(line);
					if (todo) this.allTodos.push(todo);
				}
				this.search();
				this.mode = false;
			},
			exportTodos: function() {
				this.mode = 'import';
				this.importTextarea = this.allTodos.map( todo => {
					const done = todo.done ? `x ${msToString(todo.done)} ` : '';
					const pri = todo.pri == 'A' || todo.pri == 'B' ? `(${todo.pri}) ` : '';
					return done + pri + msToString(todo.open) + ' ' + todo.desc;
				}).join('\n');
				this.allTodos = [];
			},
		},
	});
});

var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';

window.onbeforeunload = () => true;
// window.onbeforeunload = null;
