let N = 0;
let W = 0;
let P = 0;
let total_spent = [];
let total_bet_on = [];

class Utility{

	constructor(){
		//
	}

	removeDuplicates(arr){
    	let unique_array = Array.from(new Set(arr));
    	return unique_array;
	}


	printMatrix(matrix, rows){
		console.log("In printMatrix")
		for(var i=0; i<rows; i++){
	      for(var j=0; j<rows; j++){
	        console.log(i+" to "+j+": "+matrix[i][j])
	      }
	    }
	}

	Create2DArray(rows) {
	  var arr = [];
	  for (var i=0;i<rows;i++) {
	     arr[i] = [];
	  }
	  return arr;
	}

	createPosMatrix(rawMatrix, rows) {
		for(var i=0; i<rows; i++){
			for(var j=0; j<rows; j++){
				if(i==j) {
					rawMatrix[i][j] = 0;
				} else {
					rawMatrix[i][j] = (Math.random() * 10).toFixed(2);
				}
			}
		}
		return rawMatrix;
	}

	GetTotals(posMatrix, rows)
	{	  
	  for(var i=0; i<rows; i++){
	    let sum_1 = 0;
	    let sum_2 = 0;
	    for(var j=0; j<rows; j++){
	      sum_1 = sum_1 + posMatrix[i][j];
	      sum_2 = sum_2 + posMatrix[j][i];
	    }
	    total_spent[i] = sum_1;
	    total_bet_on[i] = sum_2;
	  }       

	  for(var i=0; i<rows; i++){
	   N = N + parseFloat(total_bet_on[i]);
	  }
	  console.log("N: "+N)
	}


	GetWts(wt_array, pos_array, rows)
	{
	  for(var i=0; i<rows; i++){
	        for(var j=0; j<rows; j++){
	            //Returns random number between 0 and 9
	            wt_array[i][j] = (parseFloat(pos_array[i][j])*(N/parseFloat(total_bet_on[j]))).toFixed(2);
	            W = W + parseFloat(wt_array[i][j]);
	        }
	  }
	  console.log("W: "+W)

	  return wt_array;
	}

	GetProbs(prob_array, wt_array, rows)
	{
	  for(var i=0; i<rows; i++){
	        for(var j=0; j<rows; j++){
	            //Returns random number between 0 and 9
	            prob_array[i][j] = (parseFloat(wt_array[i][j])/W).toFixed(2);
	            P = P + parseFloat(prob_array[i][j]);
	        }
	  }
	  return prob_array;
	}

	RunRoulette(prob_array, rows)
	{
	  let winner_couple = {};
	  let ball_on = Math.random()
	  console.log("Ball on: "+ ball_on)
	  let sum = 0
	  for(var i = 0; i<rows; i++)
	  {
		   for(var j = 0; j<rows; j++){
		    sum = sum+parseFloat(prob_array[i][j]);
		       if(ball_on <= sum){
		       		console.log("i: "+i+" j: "+j)
		       		winner_couple['better'] = i;
		       		winner_couple['bettee'] = j;
		       		return winner_couple;
		       } 
		   }   
	  }
	
	  N=0;
	  W=0;
	  P=0;
	  total_spent = [];
	  total_bet_on = [];
	}
}

module.exports = Utility;