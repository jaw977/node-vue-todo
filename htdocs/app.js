window.addEventListener('load', function () {
	var vue = new Vue({
		el: '#app',
		data: {
			numberOfCols: 3,
			allTodos: [
				{desc:'First',  done:false, pri:'C', matches:true,},
				{desc:'Second', done:false, pri:'C', matches:true,},
				{desc:'Third',  done:false, pri:'C', matches:true,},
				{desc:'Fourth', done:false, pri:'C', matches:true,},
				{desc:'Fifth',  done:false, pri:'C', matches:true,},
			],
			addTodoTextbox: '',
			searchMode: 'Open',
			searchText: '',
		},
		computed: {
			matchingTodos: function() {
				return this.allTodos.filter( t => t.matches );
			},
			numberOfRows: function() {
				return Math.ceil(this.allTodos.length / this.numberOfCols);
			},
			chunkedTodos: function() {
				return _.chunk(this.matchingTodos, this.numberOfCols);
			},
		},
		methods: {
			addTodo: function() {
				this.allTodos.push({desc:this.addTodoTextbox, done:false, pri:'C', matches:true,});
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
				}
			},
		},
	});
});
