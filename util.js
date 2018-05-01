class Utility{

	constructor(){
		//
	}

	Create2DArray(rows) {
	  var arr = [];
	  for (var i=0;i<rows;i++) {
	     arr[i] = [];
	  }
	  return arr;
	}

	createPosMatrix(rawMatrix, bets, rows, keys) {
		console.log("OBJECT :"+bets);
		for(var i=0; i<rows; i++){
			console.log("Bets from i: "+bets[keys[i]]);
			let bets_from_i = Object.values(bets[keys[i]])
			console.log("YYYY: "+typeof(bets_from_i))
			
			for(var j=0; j<rows; j++){
				if(i==j) {
					rawMatrix[i][j] = 0;
				} else {
					let bets_from_i_to_j = "";
					console.log("Inside loop: "+bets[keys[i]]);
					bets_from_i_to_j = bets_from_i[j].split("~")[1];
					console.log("OOOOPS: "+bets_from_i_to_j);
					//rawMatrix[i][j] = bets_from_i_to[j].split("~")[1];
				}
			}
		}
	}

	GetTotals(raw_matrix, rows)
	{	  
	  for(var i=0; i<rows; i++){
	    sum_1 = 0;
	    sum_2 = 0;
	    for(j=0; j<rows; j++){
	      sum_1 = sum_1 + raw_matrix[i][j];
	      sum_2 = sum_2 + raw_matrix[j][i];
	    }
	    total_spent[i] = sum_1;
	    total_bet_on[i] = sum_2;
	  }       

	  for(i=0; i<rows; i++){
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

	  //return wt_array;
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
	  //return prob_array;
	}
}

module.exports = Utility;