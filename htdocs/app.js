function newTodo (desc) {
	return { desc, done: false, pri:'C', matches:true, order:'C' };
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
				this.allTodos.push(newTodo(this.addTodoTextbox));
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
					todo.order = this.searchMode == 'Open' ? todo.pri : -todo.done;
				}
			},
		},
	});
});
