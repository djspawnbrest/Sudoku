module.exports = function solveSudoku(matrix) {
	// your solution
	Sudoku = function(in_matrix) {
		
		let resultArr = [];
		let steps = 0;

		initWorkArr(in_matrix);
		start_solution();

		/*
		* Initialization of the working array
		*
		* The working array is a 9x9 matrix, each element of which
		* is a list of three elements: number, type of element (in - filled
		* by convention, unknown - no solution found, resultArr - finded) and poss_val - list
		* possible element values.
		*/
		function initWorkArr(in_matrix) {
			steps = 0;
			let poss_val = [1, 2, 3, 4, 5, 6, 7, 8, 9];
			for (let i=0; i<9; i++) {
				resultArr[i] = [];
				for (let j=0; j<9; j++) {
					if ( in_matrix[i][j] ) {
						resultArr[i][j] = [in_matrix[i][j], 'in', []];
					}
					else {
						resultArr[i][j] = [0, 'unknown', poss_val];
					}
				}
			}
		}; // end of method initWorkArr()



		/*
		* Sudoku solution
		*
		* The method in the cycle is trying to solve sudoku, if at the current stage has not changed
		* no item, then the decision is terminated.
		*/
		function start_solution() {
			let changed = 0;
			do {
				// narrow the set of values ??for all unresolved numbers
				changed = updPossVal();
				steps++;
				if ( 81 < steps ) {
					// Protect from the loop
					break;
				}
			} while (changed);

			if ( !isSuccess() && !isFailed() ) {
				// use search with return
				backtrackingSearch();
			}
		}; // end of method start_solution()



		/*
		* We update many assumptions
		*
		* Check the basic rules - uniqueness in the row, column and section.
		*/
		function updPossVal() {
			let changed = 0;
			let buf = arrayDiff(resultArr[1][3][2], rowContent(1));
			buf = arrayDiff(buf, colContent(3));
			buf = arrayDiff(buf, sectContent(1, 3));
			for (let i=0; i<9; i++) {
				for (let j=0; j<9; j++) {
					if ( 'unknown' != resultArr[i][j][1] ) {
						// Solution here is either found or specified
						continue;
					}

					// "Single"
					changed += solSingle(i, j);
					
					// "Hidden Single"
					changed += solHidSingle(i, j);
				}
			}
			return changed;
		}; // end of methos updPossVal()


		/*
		* Method "Single"
		*/
		function solSingle(i, j) {
			resultArr[i][j][2] = arrayDiff(resultArr[i][j][2], rowContent(i));
			resultArr[i][j][2] = arrayDiff(resultArr[i][j][2], colContent(j));
			resultArr[i][j][2] = arrayDiff(resultArr[i][j][2], sectContent(i, j));
			if ( 1 == resultArr[i][j][2].length ) {
				// Исключили все варианты кроме одного
				markAsFinded(i, j, resultArr[i][j][2][0]);
				return 1;
			}
			return 0;
		}; // end of method solSingle()


		/*
		* Method "Hidden Single"
		*/
		function solHidSingle(i, j) {
			let less_possVal = minRowPossVal(i, j);
			let changed = 0;
			if ( 1 == less_possVal.length ) {
				markAsFinded(i, j, less_possVal[0]);
				changed++;
			}
			if ( 1 == less_possVal.length ) {
				markAsFinded(i, j, less_possVal[0]);
				changed++;
			}
			if ( 1 == less_possVal.length ) {
				markAsFinded(i, j, less_possVal[0]);
				changed++;
			}
			return changed;
		}; // end of method solHidSingle()
		
		
		/*
		* Mark found item
		*/
		function markAsFinded(i, j, start_solution) {
			resultArr[i][j][0] = start_solution;
			resultArr[i][j][1] = 'finded';
		}; // end of method markAsFinded()


		/*
		* Row Content
		*/
		function rowContent(i) {
			let content = [];
			for (let j=0; j<9; j++) {
				if ( 'unknown' != resultArr[i][j][1] ) {
					content[content.length] = resultArr[i][j][0];
				}
			}
			return content;
		}; // end of method rowContent()


		/*
		* Col Content
		*/
		function colContent(j) {
			let content = [];
			for (let i=0; i<9; i++) {
				if ( 'unknown' != resultArr[i][j][1] ) {
					content[content.length] = resultArr[i][j][0];
				}
			}
			return content;
		}; // end of method colContent()


		/*
		* Section content
		*/
		function sectContent(i, j) {
			let content = [];
			let offset = sectOffset(i, j);
			for (let k=0; k<3; k++) {
				for (let l=0; l<3; l++) {
					if ( 'unknown' != resultArr[offset.i+k][offset.j+l][1] ) {
						content[content.length] = resultArr[offset.i+k][offset.j+l][0];
					}
				}
			}
			return content;
		}; // end of method sectContent()


		/*
		* Минимизированное множество предположений по строке
		*/
		function minRowPossVal(i, j) {
			let less_possVal = resultArr[i][j][2];
			for (let k=0; k<9; k++) {
				if ( k == j || 'unknown' != resultArr[i][k][1] ) {
					continue;
				}
				less_possVal = arrayDiff(less_possVal, resultArr[i][k][2]);
			}
			return less_possVal;
		}; // end of method minRowPossVal()


		/*
		* Minimized set of string assumptions
		*/
		function lessColPossVal(i, j) {
			let less_possVal = resultArr[i][j][2];
			for (let k=0; k<9; k++) {
				if ( k == i || 'unknown' != resultArr[k][j][1] ) {
					continue;
				}
				less_possVal = arrayDiff(less_possVal, resultArr[k][j][2]);
			}
			return less_possVal;
		}; // end of method lessColPossVal()


		/*
		* Minimized set of assumptions per section
		*/
		function lessSectPosVal(i, j) {
			let less_possVal = resultArr[i][j][2];
			let offset = sectOffset(i, j);
			for (let k=0; k<3; k++) {
				for (let l=0; l<3; l++) {
					if ( ((offset.i+k) == i  && (offset.j+l) == j)|| 'unknown' != resultArr[offset.i+k][offset.j+l][1] ) {
						continue;
					}
					less_possVal = arrayDiff(less_possVal, resultArr[offset.i+k][offset.j+l][2]);
				}
			}
			return less_possVal;
		}; // end of method lessSectPosVal()


		/*
		* Calculate the difference between two arrays
		*/
		function arrayDiff (ar1, ar2) {
			let arr_diff = [];
			for (let i=0; i<ar1.length; i++) {
				let is_found = false;
				for (let j=0; j<ar2.length; j++) {
					if ( ar1[i] == ar2[j] ) {
						is_found = true;
						break;
					}
				}
				if ( !is_found ) {
					arr_diff[arr_diff.length] = ar1[i];
				}
			}
			return arr_diff;
		}; // end of method arrayDiff()


		/*
		* Unique array values
		*/
		function arrayUniq(ar){
			let sorter = {};
			for(let i=0,j=ar.length;i<j;i++){
			sorter[ar[i]] = ar[i];
			}
			ar = [];
			for(let i in sorter){
			ar.push(i);
			}
			return ar;
		}; // end of method arrayUniq()

		
		/*
		* Section Offset Calculation
		*/
		function sectOffset(i, j) {
			return {
				j: Math.floor(j/3)*3,
				i: Math.floor(i/3)*3
			};
		}; // end of method sectOffset()


		/*
		* Public method of returning the found solution
		*/
		this.result = function() {
			let res = [];
			for (let i=0; i<9; i++) {
				let temprow = [];
				for (let j=0; j<9; j++) {
					temprow.push(resultArr[i][j][0]);
				}
				res.push(temprow);
			}
			return res;
		}; // end of method html()


		/*
		* Check for found solution
		*/
		function isSuccess() {
			let is_success = true;
			for (let i=0; i<9; i++) {
				for (let j=0; j<9; j++ ) {
					if ( 'unknown' == resultArr[i][j][1] ) {
						is_success = false;
					}
				}
			}
			return is_success;
		}; // end of method isSuccess()


		/*
		* Public method isSuccess
		*/
		this.isSuccess = function() {
			return isSuccess();
		}; // end of public method isSuccess()


		/*
		* Is there a mistake in finding a solution?
		*
		* Returns true if at least one of the cells that were not found.
		* no candidates
		*/
		function isFailed() {
			let is_failed = false;
			for (let i=0; i<9; i++) {
				for (let j=0; j<9; j++) {
					if ( 'unknown' == resultArr[i][j][1] && !resultArr[i][j][2].length ) {
						is_failed = true;
					}
				}
			}
			return is_failed;
		}; // end of method isFailed()


		/*
		* Public method isFailed
		*/
		this.isFailed = function() {
			return isFailed();
		}; // end of public method isFailed()


		/*
		* Search method with return
		*/
		function backtrackingSearch() {
			// We form a new array
			let in_matrix = [[], [], [], [], [], [], [], [], []];
			let i_min=-1, j_min=-1, possVal_cnt=0;
			for (let i=0; i<9; i++) {
				in_matrix[i].length = 9;
				for (let j=0; j<9; j++ ) {
					in_matrix[i][j] = resultArr[i][j][0];
					if ( 'unknown' == resultArr[i][j][1] && (resultArr[i][j][2].length < possVal_cnt || !possVal_cnt) ) {
						possVal_cnt = resultArr[i][j][2].length;
						i_min = i;
						j_min = j;
					}
				}
			}

			
			// go through all the elements, find the unresolved,
			// choose a candidate and try to solve
			for (let k=0; k<possVal_cnt; k++ ) {
				in_matrix[i_min][j_min] = resultArr[i_min][j_min][2][k];
				// инициируем новый цикл
				let sudoku = new Sudoku(in_matrix);
				if ( sudoku.isSuccess() ) {
					// нашли решение
					out_val = sudoku.resultArr();
					// Записываем найденное решение
					for (let i=0; i<9; i++) {
						for (let j=0; j<9; j++) {
							if ( 'unknown' == resultArr[i][j][1] ) {
								markAsFinded(i, j, out_val[i][j][0])
							}
						}
					}
					return;
				}
			}
		}; // end of function backtrackingSearch)(


		/*
		* Returns the solution found
		*/
		this.resultArr = function() {
			return resultArr;
		}; // end of resultArr()
	};
	
	let mt = new Sudoku(matrix);
	//Returns the resolved array to test
	return mt.result();
}