(function() {
	// Create the connector object
	var myConnector = tableau.makeConnector();

	// Define the schema
	myConnector.getSchema = function(schemaCallback) {
		var cols = [{
			id: "id",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "periodFrom",
			alias: "Period start time",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "periodTo",
			alias: "Period end time",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "countryKey",
			alias: "Country abbreviation",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "countryLabel",
			alias: "Country name",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "adjacentSystemsKey",
			alias: "Adjacent system key",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "adjacentSystemsLabel",
			alias: "Adjacent system name",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "directionKey",
			alias: "Direction of transmission",
			dataType: tableau.dataTypeEnum.string
		}, {
			id: "value",
			alias: "Value of transmission",
			dataType: tableau.dataTypeEnum.float
		}, {
			id: "unit",
			alias: "Tranmission unit",
			dataType: tableau.dataTypeEnum.string
		}];

		var tableSchema = {
			id: "EntsogFeed",
			alias: "Natural gas transmission",
			columns: cols
		};

		schemaCallback([tableSchema]);
	};

	// Download the data
	myConnector.getData = function(table, doneCallback) {
		var dateObj = JSON.parse(tableau.connectionData),
			start = dateObj.startDate,
			end = dateObj.endDate,
			start_point = new Date(start),
			end_point = new Date(end),
			diff = (end_point - start_point)/86400000,
			pointer = new Date(start);
		
		for (var count=0 ; count < diff; count ++) {
		
			start_string = pointer.toISOString().split('T')[0];
			pointer.setDate(pointer.getDate() + 1);
			end_string = pointer.toISOString().split('T')[0];

			api_call = "https://transparency.entsog.eu/api/v1/aggregateddata?&from="+ start_string + "&to=" + end_string + "&periodType=day&timezone=CET&limit=-1"

			$.ajax({
				url:api_call, 
				async: false,
				success: function(resp) {
					var data = resp.aggregateddata,
						tableData = [];

					for (var i = 0, len = data.length; i < len; i++) {
						tableData.push({
							"id": data[i].id,
							"periodFrom": data[i].periodFrom,
							"periodTo": data[i].periodTo,
							"countryKey": data[i].countryKey,
							"countryLabel": data[i].countryLabel,
							"adjacentSystemsKey": data[i].adjacentSystemsKey,
							"adjacentSystemsLabel": data[i].adjacentSystemsLabel,
							"directionKey": data[i].directionKey,
							"value": data[i].value,
							"unit": data[i].unit
						});
					}
					tableau.reportProgress("Getting data on " + start_string)
					table.appendRows(tableData);
					
				},
			});
		};
		doneCallback();
	};

	tableau.registerConnector(myConnector);

	// Create event listeners for when the user submits the form
	$(document).ready(function() {
        $("#submitButton").click(function() {
            var dateObj = {
                startDate: $('#start-date-one').val().trim(),
                endDate: $('#end-date-one').val().trim(),
            };

            // Simple date validation: Call the getDate function on the date object created
            function isValidDate(dateStr) {
                var d = new Date(dateStr);
                return !isNaN(d.getDate());
            }

            if (isValidDate(dateObj.startDate) && isValidDate(dateObj.endDate)) {
                tableau.connectionData =JSON.stringify(dateObj); // Use this variable to pass data to your getSchema and getData functions
                tableau.connectionName = "ENTSOG Data Feed"; // This will be the data source name in Tableau
                tableau.submit(); // This sends the connector object to Tableau
            } else {
                $('#errorMsg').html("Enter valid dates. For example, 2015/01/01.");
            }
        });
    });
})();



// var text = "";
// var i = 0;
// a = [1,2,3,4,5,6,7,8,9,10]

// while (i < 10) {
//   text += "<br>The number is " + i;
//   console.log(a[i])
//   i += 2;
// }

// start = '2019/01/01'
// end = '2023/01/08'

// start_point = new Date(start)
// end_point = new Date(end)
// diff = (end_point - start_point)/86400000

// console.log(diff)

// pointer = new Date(start)
// console.log(pointer)


// for (var i=0; i < diff; i++) {
//   start_string = pointer.toISOString().split('T')[0];
//   pointer.setDate(pointer.getDate() + 1);
//   end_string = pointer.toISOString().split('T')[0];

//   console.log(start_string, end_string)
// } 


// "https://transparency.entsog.eu/api/v1/aggregateddata?&from=2015-01-01&to=2015-01-02&periodType=day&timezone=CET&limit=-1.json"