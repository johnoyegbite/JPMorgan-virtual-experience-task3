import React, { Component } from 'react';
import { Table } from '@jpmorganchase/perspective';
import { ServerRespond } from './DataStreamer';
import { DataManipulator } from './DataManipulator';
import './Graph.css';

interface IProps {
  data: ServerRespond[],
}

interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void,
}
class Graph extends Component<IProps, {}> {
  table: Table | undefined;

  render() {
    return React.createElement('perspective-viewer');
  }

  componentDidMount() {
    // Get element from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as unknown as PerspectiveViewerElement;

    const schema = {
      /** Price (average) for stock ABC */
      price_abc: "float",
      /** Price (average) for stock DEF */
      price_def: "float",
      /** Ratio between "price_abc" and "price_def" */
      ratio: "float",
      /** ratio upper bound*/
      upper_bound: "float",
      /** ratio lower bound */
      lower_bound: "float",
      /** Data point that crosses either the upper or lower bounds
       * if the data point does not crosses, nothing is registered and represented by "undefined"
       */
      trigger_alert: "float", 
      /** Maximum timestamp between stock ABC and stock DEF */
      timestamp: "date",
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }
    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);
      /** Assing the kind of Graph we want to visualize. 
       *(i.e. "y_line" type in this case) 
       */
      elem.setAttribute('view', 'y_line');
      /** Allows x-axis data point mappings */
      elem.setAttribute('row-pivots', '["timestamp"]');
      /** y-axis data point mappings to use */
      elem.setAttribute('columns', '["ratio", "upper_bound", "lower_bound", "trigger_alert"]');
      /** Handle cases of duplicated data points and consolidate them as just one data point. */
      elem.setAttribute('aggregates', JSON.stringify({
        price_abc: 'avg',
        price_def: 'avg',
        ratio: 'avg',
        upper_bound: 'avg',
        lower_bound: 'avg',
        trigger_alert: 'avg',
        timestamp: 'distinct count',
      }));
    }
  }

  componentDidUpdate() {
    if (this.table) {
      this.table.update([
        DataManipulator.generateRow(this.props.data),
      ]);
    }
  }
}

export default Graph;
