
import DOM from './dom';
import Contract from './contract';
import './flightsurety.css';
var BigNumber = require('bignumber.js');


(async() => {

    let result = null;

    let contract = new Contract('localhost', async() => {

        // Read transaction
        contract.isOperational((error, result) => {
            display('Operational Status', 'Check if contract is operational', [ { label: 'Operational Status', error: error, value: result} ]);
        });

        contract.getAirlineAddress((result) => {
            for (let idx = 0; idx < result.length; idx++) {
                DOM.elid('airline-address').add(new Option(result[idx]));
            }  
            DOM.elid('airline-address').selectedIndex = -1;        
        });

        // Get airline name
        DOM.elid('airline-address').addEventListener('change', (event) => {
            while (DOM.elid('flight-number').options.length > 0) {                
                DOM.elid('flight-number').remove(0);
            }  
            let airline = DOM.elid('airline-address').options[DOM.elid('airline-address').selectedIndex].value;
            contract.getAirlineName(airline, (result) => {
                DOM.elid('airline-name').value = result;        
          });
        })

        // User-submitted transaction
        DOM.elid('getFlightInfo').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').options[DOM.elid('airline-address').selectedIndex].value;
            // Write transaction
            contract.getFlightInfo(airline, (error, result) => {
                for(let idx = 0; idx < result.length; idx++) {
                    contract.getFlightNumber(result[idx], (error, result) => {
                        DOM.elid('flight-number').add(new Option(result));
                    });
                }
                DOM.elid('flight-number').selectedIndex = -1;
            });
        })

        DOM.elid('submit-oracle').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').options[DOM.elid('airline-address').selectedIndex].value;
            let flight = DOM.elid('flight-number').value;
            // Write transaction
            contract.fetchFlightStatus(airline, flight, (error, result) => {
                display('Oracles', 'Trigger oracles', [ { label: 'Fetch Flight Status', error: error, value: result.flight + ' ' + result.timestamp} ]);
            });
        })

        DOM.elid('buy-insurance').addEventListener('click', () => {
            let airline = DOM.elid('airline-address').options[DOM.elid('airline-address').selectedIndex].value;
            let flight = DOM.elid('flight-number').options[DOM.elid('flight-number').selectedIndex].value;
            let amount = DOM.elid('insurance_premium').value;
            contract.buyFlightInsurance(airline, flight, amount, (error, result) => {
                display('Buy Insurance', 'Buy insurance', [ { label: 'Status', error: error, value: 'success'} ]);
            });
        })

        DOM.elid('check-credits').addEventListener('click', () => {
            contract.getCreditsAmount((error, result) => {
                display('Credits', 'Check passenger credit amount', [ { label: 'Credits (Eth)', error: error, value: result / (new BigNumber(10)).pow(18)} ]);
            });
        })

        DOM.elid('withdraw-credits').addEventListener('click', () => {
            contract.withdrawCredits((error, result) => {
                display('Withdraw Credits', 'Withdraw credits', [ { label: 'Status', error: error, value: 'success'} ]);
            });
        })    
    });  
})();


function display(title, description, results) {
    let displayDiv = DOM.elid("display-wrapper");
    let section = DOM.section();
    section.appendChild(DOM.h2(title));
    section.appendChild(DOM.h5(description));
    results.map((result) => {
        let row = section.appendChild(DOM.div({className:'row'}));
        row.appendChild(DOM.div({className: 'col-sm-4 field'}, result.label));
        row.appendChild(DOM.div({className: 'col-sm-8 field-value'}, result.error ? String(result.error) : String(result.value)));
        section.appendChild(row);
    })
    displayDiv.append(section);

}







