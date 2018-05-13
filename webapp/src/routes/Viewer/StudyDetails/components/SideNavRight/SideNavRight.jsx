import React from 'react';
const _ = require('lodash');
import deepAssign from 'assign-deep';
import renderSection from 'modules/sectionRender';
import {LinkContainer} from 'react-router-bootstrap';
import {Link} from 'react-router';
import moment from 'moment';
import {Colors} from 'consts';
import {RoutedComponent, connect} from 'routes/routedComponent';
import projectsData from 'consts/data/projects.json';
const uuidv1 = require('uuid/v1');
import Notifications from 'react-notification-system-redux';

import classes from './SideNavRight.scss';
import Toggle from 'react-toggle';

import {
  classificationCheckboxToggle,
  updateSelectedStudy,
  updateTextArea
} from '../../actions'

import {
    Row,
    Col,
    Button,
    Table,
    InputGroup,
    FormControl,
    Form,
    FormGroup,
    ControlLabel,
		ButtonGroup,
		OverlayTrigger,
    HelpBlock,
    Checkbox,
    Panel,
    Tabs,
    Tab,
		Tooltip,
    ProgressBar
} from 'components';

class SideNavRight extends React.Component {
	static propTypes = {
		inner_height: React.PropTypes.number.isRequired,
	}

	static defaultProps = {
	}

	constructor(props, context) {
		super(props, context);

		this.state = {
			inner_height : this.props.inner_height - 15,
			study : this.props.current_study
		};
		this.onCheckBoxChange = this.onCheckBoxChange.bind(this);
		this.onSubmitReport = this.onSubmitReport.bind(this);
		this.onTextChange = this.onTextChange.bind(this);
		this.navigate_to_study = this.navigate_to_study.bind(this);
	}

	// Toggle Checkbox
	onCheckBoxChange(e) {
		const {study} = this.state;
		var {rad_report} = study;
		var _class = _.find(rad_report.class_scores, ["class", e.target.value])
		_class.checked = !_class.checked;
		this.setState({study: study});
	}

	onTextChange(e) {
		const {study, dispatch} = this.props;
		var {rad_report} = study;
		var _text = _.find(rad_report.text_fields, ["name", e.target.id])
		_text.text = e.target.value;
		this.setState({study: study});
	}

	onSubmitReport() {
		const {dispatch} = this.props;
		const {study} = this.state;
		const item = Object.assign({}, study);


		if (item.dicom_tags) {
			const elem = item.dicom_tags
			item['name'] = _.startCase(_.toLower(elem.PatientName.replace("^", "	")));
		} else if(item.dicom_elements) {
			const elem = item.dicom_elements
			item['name'] = _.startCase(_.toLower(elem.PatientName.value.replace("^", "	")));
		}

		const notificationOpts = {
		  // uid: 'once-please', // you can specify your own uid if required
		  title: 'Study Submitted.',
		  message: `Patient Name : ${item.name}`,
		  position: 'tr',
		  autoDismiss: 3,
		  action: {
		    label: 'Undo',
		    callback: () => alert('clicked!')
		  }
		};

		const {rad_report} = study;
		if(_.find(rad_report.class_scores, (o) => o["checked"])) {
			const notificationOpts = {
			  // uid: 'once-please', // you can specify your own uid if required
			  title: 'Study Submitted',
			  message: `Patient Name : ${item.name}`,
			  position: 'tr',
			  autoDismiss: 3,
			  action: {
			    label: 'Undo',
			    callback: () => alert('clicked!')
			  }
			};
			dispatch(Notifications.success(notificationOpts));
			dispatch(updateSelectedStudy(study));
		} else {
			const notificationOpts = {
			  // uid: 'once-please', // you can specify your own uid if required
			  title: 'Error Submitting Report',
			  position: 'tr',
			  autoDismiss: 3,
				children: (
			    <div>
			      <h4 className="text-warning">Patient Name : {item.name}</h4>
			      <h5 className="text-warning">Please select a classification. If no disease if found, please select "No findings"</h5>
			    </div>
			  )
			};
			dispatch(Notifications.error(notificationOpts));
		}

	}

	navigate_to_study(router, study, _params) {
		const {params} = this.props;
		if (study.uuid) {
			router.push('/viewer/study-details/' + params["status"] + "/" + study.uuid)
		} else {
			console.error("Attempt to navigate to an undefined ID")
		}
	}

	componentWillReceiveProps(nextProps){
      if(nextProps.current_study !== this.props.current_study){
				this.setState({study: nextProps.current_study});
      }
  }

	render() {
		const {router, previous_study, next_study, params} = this.props;
		const {inner_height, study} = this.state;
		const {rad_report} = study;
		const show_model_results = false;
		return (
			<Row>
			{
				<Panel
					type='color-border-full'
					bsStyle='primary'
					fullBody={true}
					flexHeader={true}
					maxHeight={inner_height}
					header={<div className = {classes.panelHeader}>
									{
										(study.dicom_tags ||  study.dicom_elements) &&
										<div>
											<h4 className={classes.panelHeaderTitle}>
											 Classification Results
											</h4>
										</div>
									}
									</div>}
					footer={<div className = 'text-center' >
							<ButtonGroup>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Back to Study List
												</Tooltip>
										)}>
										<Button
												onClick={ () => router.push('/start/home/' + params["status"] ) }>
											<i className="fa fa-fw fa-list-ul"></i>
										</Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Previous Case or Study
												</Tooltip>
										)}>
										<Button
												onClick={() => this.navigate_to_study(router, previous_study, params)}
												disabled={!previous_study}
												outline>
											<i className="fa fa-fw fa-arrow-circle-left"></i>
										</Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Next Case or Study
												</Tooltip>
										)}>
										<Button
												onClick={() => this.navigate_to_study(router, next_study, params)}
												disabled={!next_study}
												outline>
											<i className="fa fa-fw fa-arrow-circle-right"></i>
										</Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Submit Report
												</Tooltip>
										)}>
										<Button
												onClick={this.onSubmitReport}
												outline>
												Submit Report
											<i className="fa fa-fw fa-paper-plane"></i>
										</Button>
								</OverlayTrigger>
							</ButtonGroup>
						</div>}>
					<Tabs defaultActiveKey={1} id="justified-tab-example" justified>
						<Tab eventKey={1} title="Classes">
							<Table>
								<thead>
									<tr>
										<th>
											<p className='text-primary'>Disease or Observation</p>
										</th>
										<th>
											<p className='text-primary'>Model Scores</p>
										</th>
										<th>
											<p className='text-primary'>Selected</p>
										</th>
									</tr>
								</thead>
								<tbody>
									{rad_report &&
										_.map(rad_report.class_scores, (class_score, index) => (
											<tr  key={index}>
												<td>
													<p className='text-aquamarine'>{class_score.class}</p>
												</td>
												<td>
													{ show_model_results ?
														<p className='text-white'>{(class_score.score * 100).toFixed(2)}%</p>
														:
														<p className='text-grey'>---</p>
													}
												</td>
												<td className="text-mint-green">
													<Toggle checked={class_score.checked}
														name={class_score.class}
														value={class_score.class}
														onChange={this.onCheckBoxChange}/>
												</td>
											</tr>))
									}
								</tbody>
							</Table>
						</Tab>
						<Tab eventKey={2} title="Text">
							<Form>
							{rad_report &&
								_.map(rad_report.text_fields, (text_field, index) => (
									<FormGroup controlId={text_field.name}>
											<Col componentClass={ControlLabel} sm={3}>
													{text_field.name}
											</Col>
											<Col sm={9}>
											<FormControl
												componentClass="textarea"
							            type="text"
							            value={text_field.text}
							            placeholder="Enter text"
							            onChange={this.onTextChange}
							          />
											</Col>
									</FormGroup>))
							}
							</Form>
						</Tab>
					</Tabs>

				</Panel>
			}

			</Row>
		);
	}
}

const mapStateToProps = (state) => {
	const {selected_study, studies} = state;
	return Object.assign({}, selected_study, studies)
}

export default connect(mapStateToProps)(SideNavRight);
