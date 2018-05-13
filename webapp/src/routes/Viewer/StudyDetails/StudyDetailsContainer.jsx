import React from 'react';
import moment from 'moment';
import truncate from 'truncate';
import { LinkContainer } from 'react-router-bootstrap';
import { Link } from 'react-router';
const _ = require('lodash');
import { CircleLoader } from 'react-spinners';
import Sidebar from 'react-sidebar';
import base64 from 'base64-js';
const mql = window.matchMedia(`(min-width: 800px)`);
import {
    Row,
    Col,
    Panel,
    Button,
    ButtonGroup,
    ButtonToolbar,
    OverlayTrigger,
    Tooltip,
} from 'components';

import {
  fetchSelectedStudy
} from './actions'

import {
  selectStudyList
} from '../../Studies/actions'

import {
    CONTENT_VIEW_STATIC,
    CONTENT_VIEW_FLUID,
    CONTENT_VIEW_BOXED,
} from 'layouts/DefaultLayout/modules/layout';

import { RoutedComponent, connect } from 'routes/routedComponent';
import treeRandomizer from 'modules/treeRandomizer';
import renderSection from 'modules/sectionRender';

import { Colors, Config } from 'consts';

import Hammer from 'hammerjs';
import * as dicomParser from 'dicom-parser';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneMath from 'cornerstone-math';
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader';	// JPEG/PNG
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'

import classes from './StudyDetails.scss';


// ------------------------------------
// Subcomponents
// ------------------------------------
import {
    SideNavLeft,
    SideNavRight,
} from './components';

// ------------------------------------
// Config / Data Generator
// ------------------------------------

// ------------------------------------
// Sub Elements
// ------------------------------------

const navigate_to_study = function(router, study, params) {
	if (study.uuid) {
		router.push('/viewer/study-details/' + params.status + "/" + study.uuid)
	} else {
		// window.location.replace(study_uuid);
		console.error("Attempt to navigate to an undefined ID")
	}
}

const renderActionBar = function(router, toggle_panel_fn, previous_study, next_study, params) {
	// console.log(!previous_study, !next_study,)
	// console.log(previous_study, next_study,)
	return (<div className={ `flex-space-between ${classes.messagePanelHeader}` }>
	        {
						<ButtonGroup>
							<OverlayTrigger
									placement='bottom'
									overlay={(
											<Tooltip id='tooltip-direction-bottom'>
													Back to Study List
											</Tooltip>
									)}>
									<Button
											onClick={ () => router.push('/start/home/' + params.status ) }>
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
											onClick={() => navigate_to_study(router, previous_study, params)}
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
											onClick={() => navigate_to_study(router, next_study, params)}
											disabled={!next_study}
											outline>
										<i className="fa fa-fw fa-arrow-circle-right"></i>
									</Button>
							</OverlayTrigger>
						</ButtonGroup>
	        }
	        <ButtonToolbar className={ classes.actionButtons }>
	            <ButtonGroup>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Window Level Tool
												</Tooltip>
										)}>
										<Button  id="enableWindowLevelTool">
		                    <i className="fa fa-sun-o"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Invert
												</Tooltip>
										)}>
										<Button id="invert" >
		                    <i className="fa fa-adjust"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Pan
												</Tooltip>
										)}>
										<Button id="pan" >
												<i className="fa fa-arrows-alt"></i>
										</Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Zoom
												</Tooltip>
										)}>
										<Button id="zoom">
		                    <i className="fa fa-search"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Measure Length
												</Tooltip>
										)}>
										<Button id="enableLength">
		                    <i className="fa fa-expand"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Point Probe
												</Tooltip>
										)}>
										<Button id="probe">
		                    <i className="fa fa-bullseye"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Circle ROI
												</Tooltip>
										)}>
										<Button id="circleroi">
		                    <i className="fa fa-circle-thin"></i>
		                </Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Rectangle ROI
												</Tooltip>
										)}>
										<Button id="rectangleroi">
												<i className="fa fa-clone"></i>
										</Button>
								</OverlayTrigger>
								<OverlayTrigger
										placement='bottom'
										overlay={(
												<Tooltip id='tooltip-direction-bottom'>
														Angle
												</Tooltip>
										)}>
										<Button id="angle">
												<i className="fa fa-angle-left"></i>
										</Button>
								</OverlayTrigger>
	            </ButtonGroup>

							<ButtonGroup>
								<Button
										onClick={() => toggle_panel_fn('right-panel')}>
									<i className="fa fa-exchange"></i>
								</Button>
							</ButtonGroup>
	        </ButtonToolbar>
	    </div>
	)
} ;

var current_elem = {}
const renderDicomViewPort = function(router, toggle_fn, study_loading, inner_width, inner_height, current_study, params, previous_study, next_study, selected_study_list){
	var viewer_style: {
		height: inner_height
 	}

	const enabled_elements = cornerstone.getEnabledElements()
	var element = undefined
	var enabled_element = enabled_elements[0]
	if (enabled_elements.length >0 ) {
		element = enabled_elements[0]
	} else {
		element = document.getElementById('dicomImage');
	}

	const {s3_info} = current_study;
	const s3_key = s3_info ? s3_info.model_input_file.Key : current_study.final_image_s3Key;

	if (s3_key && element && current_study.uuid ===  params.study_id) {

		var origin = window.location.origin
		var url = origin + "/dicom/dummy_id1234?s3Key=";

		url += s3_key

		//prefix 'dicomweb' is also supported but is deprecated and will eventually be removed.
		cornerstone.registerImageLoader('wadouri', url)
		cornerstone.registerImageLoader('dicomweb', url);
		cornerstone.registerImageLoader('dicomfile', url);

		// image enable the dicomImage element
		cornerstone.loadAndCacheImage(url).then(function(image) {
			if (cornerstone.getEnabledElements().length === 0) {
				cornerstone.enable(element);
				const enabled_element = cornerstone.getEnabledElements()[0]
				element = enabled_element.element

				cornerstone.displayImage(element, image);

				cornerstoneTools.mouseInput.enable(element);
				cornerstoneTools.mouseWheelInput.enable(element);

				// Enable mouse, mouseWheel, touch, and keyboard input on the element
				cornerstoneTools.mouseInput.enable(element);
				cornerstoneTools.touchInput.enable(element);
				cornerstoneTools.mouseWheelInput.enable(element);
				cornerstoneTools.keyboardInput.enable(element);

				// Enable all tools we want to use with this element
				cornerstoneTools.wwwc.activate(element, 1); // ww/wc is the default tool for left mouse button
				cornerstoneTools.pan.activate(element, 2); // pan is the default tool for middle mouse button
				cornerstoneTools.zoom.activate(element, 4); // zoom is the default tool for right mouse button
				cornerstoneTools.zoomWheel.activate(element); // zoom is the default tool for middle mouse wheel
				cornerstoneTools.probe.enable(element);
				cornerstoneTools.length.enable(element);
				cornerstoneTools.ellipticalRoi.enable(element);
				cornerstoneTools.rectangleRoi.enable(element);
				cornerstoneTools.angle.enable(element);
				cornerstoneTools.highlight.enable(element);
				activate("enableWindowLevelTool");

				// Tool button event handlers that set the new active tool
				document.getElementById('enableWindowLevelTool').addEventListener('click', function() {
					activate('enableWindowLevelTool')
					disableAllTools();
					cornerstoneTools.wwwc.activate(element, 1);
				});

				document.getElementById('pan').addEventListener('click', function() {
					activate('pan')
					disableAllTools();
					cornerstoneTools.pan.activate(element, 1); // 3 means left mouse button and middle mouse button
				});

				document.getElementById('invert').addEventListener('click', function() {
					var dicomImage = document.getElementById('dicomImage');
					var viewport = cornerstone.getViewport(dicomImage);
					if (viewport.invert === true) {
	            viewport.invert = false;
	        } else {
	            viewport.invert = true;
	        }
	        cornerstone.setViewport(dicomImage, viewport);
				});

				document.getElementById('zoom').addEventListener('click', function() {
					activate('zoom')
					disableAllTools();
					cornerstoneTools.zoom.activate(element, 5); // 5 means left mouse button and right mouse button
				});
				document.getElementById('enableLength').addEventListener('click', function() {
						activate('enableLength')
						disableAllTools();
						cornerstoneTools.length.activate(element, 1);
				});
				document.getElementById('probe').addEventListener('click', function() {
						activate('probe')
						disableAllTools();
						cornerstoneTools.probe.activate(element, 1);
				});
				document.getElementById('circleroi').addEventListener('click', function() {
						activate('circleroi')
						disableAllTools();
						cornerstoneTools.ellipticalRoi.activate(element, 1);
				});
				document.getElementById('rectangleroi').addEventListener('click', function() {
						activate('rectangleroi')
						disableAllTools();
						cornerstoneTools.rectangleRoi.activate(element, 1);
				});
				document.getElementById('angle').addEventListener('click', function () {
						activate('angle')
						disableAllTools();
						cornerstoneTools.angle.activate(element, 1);
				});

				// update the overlay status
        element.addEventListener('cornerstoneimagerendered', function(e) {
            const viewport = e.detail.viewport;
            const wwwc = Math.round(viewport.voi.windowWidth) + '/' + Math.round(viewport.voi.windowCenter);
            const zoom = _.round(viewport.scale, 4)  + 'x';
            document.getElementById('topright').textContent = 'WW/WC: ' + wwwc;
            document.getElementById('bottomright').textContent = 'Zoom: ' + zoom; ;
        });
				// document.getElementById('highlight').addEventListener('click', function() {
				//     activate('highlight')
				//     disableAllTools();
				//     cornerstoneTools.highlight.activate(element, 1);
				// });
				// document.getElementById('freehand').addEventListener('click', function() {
				//     activate('freehand')
				//     disableAllTools();
				//     cornerstoneTools.freehand.activate(element, 1);
				// });
			} else {
				if (enabled_element) {
					current_elem = enabled_element
					cornerstone.displayImage(enabled_element.element, image);
				}
			}



			function activate(id) {
				return;
					document.querySelectorAll('a').forEach(function(elem) {
							elem.classList.remove('active');
					});
					document.getElementById(id).classList.add('active');
			}
			// helper function used by the tool button handlers to disable the active tool
			// before making a new tool active
			function disableAllTools() {
					cornerstoneTools.wwwc.disable(element);
					cornerstoneTools.pan.activate(element, 2); // 2 is middle mouse button
					cornerstoneTools.zoom.activate(element, 4); // 4 is right mouse button
					cornerstoneTools.probe.deactivate(element, 1);
					cornerstoneTools.length.deactivate(element, 1);
					cornerstoneTools.ellipticalRoi.deactivate(element, 1);
					cornerstoneTools.rectangleRoi.deactivate(element, 1);
					cornerstoneTools.angle.deactivate(element, 1);
					cornerstoneTools.highlight.deactivate(element, 1);
					cornerstoneTools.freehand.deactivate(element, 1);
			}
		});
	}

	const {dicom_elements} = current_study
	const name = dicom_elements ? _.startCase(_.toLower(dicom_elements.PatientName.value.replace("^", "	"))) : "";
	const referring_physician_name = dicom_elements ? _.startCase(_.toLower(dicom_elements.ReferringPhysicianName.value.replace("^", "	"))) : "";
	const accession_number = dicom_elements ? dicom_elements.AccessionNumber.value : "";
	const birth_date = dicom_elements ? dicom_elements.PatientBirthDate.value : "";
	const age = dicom_elements ? dicom_elements.PatientAge.value : "";
	const sex = dicom_elements ? dicom_elements.PatientSex.value : "";

	return (
	    <Panel
					type='color-border-full'
					bsStyle='primary'
	        header={
	            renderActionBar(router, toggle_fn, previous_study, next_study, params)
	        }
			>
			<div>
					<div className="overlay text-aquamarine">
						{
							current_study.dicom_elements ?
							<div id="bottomleft"  style={{position : "absolute", bottom : "50px", left : "50px"}}>
								<div><h5>{dicom_elements.ReferringPhysicianName.name}:</h5><p>{referring_physician_name}</p></div>
							</div>
							: null
						}
						{
							current_study.dicom_elements ?
							<div id="topleft" style={{position : "absolute", top : "80px", left : "50px"}}>
								<div><h5>{dicom_elements.PatientName.name}:</h5><p>{name}</p></div>
								<div><h5>{dicom_elements.AccessionNumber.name}:</h5><p>{accession_number}</p></div>
								<div><h5>{dicom_elements.PatientBirthDate.name}:</h5><p>{birth_date} ({age})</p></div>
								<div><h5>{dicom_elements.PatientSex.name}:</h5><p>{sex}</p></div>
							</div>
							: null
						}

						<div id="bottomright" style={{position : "absolute", bottom : "50px", right : "50px"}}>
						</div>
						<div id="topright" style={{position : "absolute", top : "80px", right : "100px"}}>
						</div>
					</div>
				<div className='' id="dicomImage" style={{"height": `${inner_height}`}}>
				</div>
			</div>

	    </Panel>
	);
}
// ------------------------------------
// Main Container
// ------------------------------------
class StudyDetailsContainer extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
          closedPanels: [],
					study_loading : true,
					study_col_width : 9,
					inner_width: window.innerWidth,
					inner_height: window.innerHeight
        };

				this.isPanelOpen = this.isPanelOpen.bind(this);
				this.toggle_panel = this.toggle_panel.bind(this);
				this.updateWindowDimensions = this.updateWindowDimensions.bind(this);


				cornerstoneTools.external.dicomParser = dicomParser;
				cornerstoneTools.external.cornerstone = cornerstone;
				cornerstoneTools.external.Hammer = Hammer;
				cornerstoneTools.external.cornerstoneMath = cornerstoneMath;
				cornerstoneWebImageLoader.external.cornerstone = cornerstone;
				cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
    }

		isPanelOpen(panelId) {
				return !_.find(this.state.closedPanels, panelId);
		}

		toggle_panel(panelId) {
			if(this.isPanelOpen(panelId)) {
				this.setState({
						closedPanels: [...this.state.closedPanels, panelId],
						study_col_width: this.state.study_col_width + 3
				});
			} else {
				this.setState({
						closedPanels: _.filter(this.state.closedPanels, function(_pan_id){ return _pan_id !== panelId; }),
						study_col_width: this.state.study_col_width - 3
				});
			}

		}

		shouldComponentUpdate(nextProps, nextState){
			return true;
		}


		componentWillMount(prevProps) {
			const { dispatch, params } = this.props;
      var targetDef = {
				contentView: CONTENT_VIEW_FLUID,
				sidebarEnabled: false,
				footerEnabled: true,
				footerFixed: true,
				navbarFixed: true,
				headerEnabled: false,

			};
      // const { setCurrentPageSettings } = this.props;
      // setCurrentPageSettings(targetDef);
			dispatch(selectStudyList(params["status"]))
			dispatch(fetchSelectedStudy(params.study_id));
    }

		componentDidMount() {
			this.updateWindowDimensions();
			window.addEventListener('resize', this.updateWindowDimensions);
			this.setState({ width: window.innerWidth, height: window.innerHeight });
		}

		componentWillReceiveProps(nextProps){
		}

		componentDidUpdate(prevProps, prevState, snapshot) {
			const { dispatch, params } = this.props;
			const {study_id} = params;
			if (study_id !== prevProps.params.study_id) {
				dispatch(fetchSelectedStudy(study_id))
			}
		}



		componentWillUnmount() {
		  window.removeEventListener('resize', this.updateWindowDimensions);
			this.setState({ width: window.innerWidth, height: window.innerHeight });
			var element = document.getElementById('dicomImage');
			_.map(cornerstone.getEnabledElements(), function(item, idex){
				cornerstone.disable(item.element);
				cornerstone.imageCache.purgeCache();
			})
		}

		updateWindowDimensions() {
			this.setState({ width: window.innerWidth, height: window.innerHeight });
		}
    render() {
			var {study_col_width, study_loading, inner_width, inner_height}  = this.state;
			const {current_study, params, previous_study, next_study, history, selected_study_list} = this.props;
			inner_height = inner_height - 230;
      return (
				<div name='Studies' >
				{ true &&
					<Col lg={ study_col_width }>
 						 { renderDicomViewPort(history, this.toggle_panel, study_loading, inner_width, inner_height, current_study, params, previous_study, next_study, selected_study_list) }
 				 	</Col>
				}

				 {
					 this.isPanelOpen('right-panel') && (
						 <Col lg={ 3 }>
							 <SideNavRight
								 inner_height={inner_height}
								 router = {history}
								 params = {params}
								 folderSelected={ () => {true} }
							 />
						 </Col>
					 )
				 }
			 </div>
      )
    }
}

const mapStateToProps = (state) => {
	var {selected_study, studies} = state;
  return Object.assign({}, selected_study, studies)
}

export default connect(mapStateToProps)(StudyDetailsContainer)
