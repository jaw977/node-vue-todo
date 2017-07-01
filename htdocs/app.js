function newTodo (desc) {
	return { desc, open: Date.now(), done: false, pri:'C', matches:true, order:'C' };
}

window.addEventListener('load', function () {
	var vue = new Vue({
		el: '#app',
		data: {
			numberOfCols: 3,
			allTodos: [
				newTodo('First'),
				newTodo('Second'),
				newTodo('Third'),
				newTodo('Fourth'),
				newTodo('Fifth'),
			],
			addTodoTextbox: '',
			searchMode: 'Open',
			searchText: '',
			editingTodo: false,
			editingField: false,
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
					else this.editingTodo.open = this.stringToMs(this.addTodoTextbox);
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
				for (todo of this.allTodos) {
					todo.matches = this.searchMode == 'Open' ? ! todo.done : todo.done;
					todo.order = this.searchMode == 'Open' ? ((todo.pri == 'A' ? 1 : todo.pri == 'B' ? 2 : 3) * todo.open) : -todo.done;
				}
			},
			editTodo: function(todo,field) {
				this.editingTodo = todo;
				this.editingField = field;
				if (field == 'desc') this.addTodoTextbox = todo.desc;
				else this.addTodoTextbox = this.msToString(todo.open);
				this.$refs.addTodoTextbox.focus();
			},
			shortDate: function(ms) {
				var d = new Date(ms);
				return '' + (d.getMonth() + 1) + '/' + d.getDate();
			},
			msToString: function(ms) {
				return moment(ms).format(dateTimeFormat);
			},
			stringToMs: function(str) {
				return +moment(str, dateTimeFormat);
			},
		},
	});
});

var dateTimeFormat = 'YYYY-MM-DD HH:mm:ss';
