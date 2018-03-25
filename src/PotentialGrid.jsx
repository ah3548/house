import React, {Component} from "react";
import {AgGridReact} from "ag-grid-react";
import Client from "./Client"

// pull in the ag-grid styles we're interested in
import "ag-grid-root/dist/styles/ag-grid.css";
import MyMapComponent from "./MyMapComponent";

const maps = window.google.maps;
const DirectionsService = new maps.DirectionsService();

export default class extends Component {
    constructor(props) {
        super(props);

        this.state = {
            gridApi: {},
            columnDefs: this.createColumnDefs(),
            lon: null,
            lat: null,
            directions: null
        };

        this.onGridReady = this.onGridReady.bind(this);
        this.onSelectionChanged = this.onSelectionChanged.bind(this);
    }

    onGridReady(params) {
        this.setState({
            gridApi: params.api
        });
        this.columnApi = params.columnApi;

        Client.searchPotential().then(result => {
            this.state.gridApi.setRowData(result);
            this.state.gridApi.sizeColumnsToFit();
        });
    }

    createColumnDefs() {
        return [
            {headerName: "Address", field: "ADDRESS"},
            {headerName: "Zip Code", field: "POSTCODE"},
            {headerName: "Estimate", field: "amir estimate"},
            {headerName: "Assessed Value", field: "pluto.AssessTot"},
            {headerName: "Owner", field: "pluto.OwnerName"}
        ];
    }

    onSelectionChanged() {
        var selectedRows = this.state.gridApi.getSelectedRows();
        this.setState({
            lon: selectedRows[0].LON,
            lat: selectedRows[0].LAT
        });
        DirectionsService.route({
            origin: new maps.LatLng(selectedRows[0].LAT, selectedRows[0].LON),
            destination: new maps.LatLng(40.7359, -73.9911),
            travelMode: maps.TravelMode.TRANSIT,
        }, (result, status) => {
            if (status === maps.DirectionsStatus.OK) {
                this.setState({
                    directions: result,
                });
            } else {
                console.error(`error fetching directions ${result}`);
            }
        });
    }

    render() {
        let containerStyle = {
            height: '325px',
            width: '100%'
        };

        return (
            <div style={containerStyle} className="ag-theme-material">
                <AgGridReact
                    // properties
                    enableSorting
                    enableFilter
                    floatingFilter
                    selectionEnabled
                    columnDefs={this.state.columnDefs}
                    rowSelection="single"

                    // events
                    onGridReady={this.onGridReady}
                    onSelectionChanged={this.onSelectionChanged}
                >
                </AgGridReact>
                <MyMapComponent
                    isMarkerShown
                    lat={this.state.lat}
                    lon={this.state.lon}
                    directions={this.state.directions}
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `400px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                />            </div>
        )
    }
};