import React from 'react';
import _ from 'underscore';
import deepAssign from 'assign-deep';
import renderSection from 'modules/sectionRender';
import {LinkContainer} from 'react-router-bootstrap';
import {Link} from 'react-router';
import moment from 'moment';
import {Colors} from 'consts';
import {RoutedComponent, connect} from 'routes/routedComponent';
import projectsData from 'consts/data/projects.json';
import {Button, Table, Panel, ProgressBar} from 'components';
const uuidv4 = require('uuid/v4');

import classes from './SideNavLeft.scss';
import Toggle from 'react-toggle';

class SideNavLeft extends React.Component {
	static propTypes = {
		inner_height: React.PropTypes.number.isRequired,
		class_scores: React.PropTypes.array.isRequired,
		folderSelected: React.PropTypes.func
	}

	static defaultProps = {
		class_scores: [],
		folderSelected: () => {}
	}

	constructor(props, context) {
		super(props, context);

		this.state = {};
	}

	componentDidMount() {

	}
	render() {
		var {class_scores, inner_height} = this.props;
		inner_height = inner_height - 30;
		return (
			<Panel
				type='color-border-full'
				bsStyle='primary'
				header={<div className = {classes.panelHeader}>
									<h5 className={classes.panelHeaderTitle}>Classification Results</h5>
								</div>}
				footer={<div className = 'text-center' >
									<Button>
											Submit<i className="fa fa-angle-left"></i>
									</Button>
								</div>}
				maxHeight={inner_height}>
				<Table>
					<thead>
						<tr>
							<th>
								Switch Name
							</th>
							<th>
								Switch Example
							</th>
						</tr>
					</thead>
					<tbody>
						{
							_.map(class_scores, class_score => (
								<tr key={uuidv4()}>
									<td >
										<p>{class_score.class}</p>
										<p>{(class_score.score * 100).toFixed(2)}%</p>
									</td>
									<td>
										<Toggle checked={true} name={class_score.class} value='yes' onChange={() => {}}/>
									</td>
								</tr>))
						}
					</tbody>
				</Table>
		</Panel>);
	}
}

export default connect()(SideNavLeft);
