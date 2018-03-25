import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import Client from "./Client"

// pull in the ag-grid styles we're interested in
import "ag-grid-root/dist/styles/ag-grid.css";
import "ag-grid-root/dist/styles/theme-fresh.css";

export default class extends Component {
    constructor(props) {
        super(props);

        //Client.search().then(Client.writeMongo);
        this.state = {
            columnDefs: this.createColumnDefs()
        }
    }

    onGridReady(params) {
        this.gridApi = params.api;
        this.columnApi = params.columnApi;

        Client.searchPropertiesMongo().then(result => {
            let data = result.map(p => p.address);
            this.gridApi.setRowData(data);
            this.gridApi.sizeColumnsToFit();
        });
    }

    createColumnDefs() {
        return [
            {headerName: "Line 1", field: "line1"},
            {headerName: "Postal", field: "postal1"}
        ];
    }

    render() {
        let containerStyle = {
            height: '325px',
            width: '100%'
        };

        return (
            <div style={containerStyle} className="ag-fresh">
                <AgGridReact
                    // properties
                    enableSorting
                    enableFilter
                    floatingFilter
                    columnDefs={this.state.columnDefs}

                    // events
                    onGridReady={this.onGridReady}>
                </AgGridReact>


            </div>
        )
    }
};