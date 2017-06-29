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
			editing: false,
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
			addTodo: function() {
				if (this.editing) this.editing.desc = this.addTodoTextbox;
				else this.allTodos.push(newTodo(this.addTodoTextbox));
				this.editing = false;
				this.addTodoTextbox = '';
			},
			todoDoneClass: function(todo) {
				return 'glyphicon glyphicon-' + (todo.done ? 'check' : 'unchecked');
			},
			priClass: function(todo) {
				return 'btn btn-xs' + (todo.pri == 'A' ? ' btn-danger' : todo.pri == 'B' ? ' btn-primary' : '');
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
			editTodo: function(todo) {
				this.editing = todo;
				this.addTodoTextbox = todo.desc;
				this.$refs.addTodoTextbox.focus();
			},
			shortDate: function(ms) {
				var d = new Date(ms);
				return '' + (d.getMonth() + 1) + '/' + d.getDate();
			},
		},
	});
});
