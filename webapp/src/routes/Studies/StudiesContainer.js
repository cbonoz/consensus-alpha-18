import React from 'react';
const querystring = require('querystring');
import leftPad from 'left-pad';
import uid from 'node-uuid';
import numeral from 'numeral';
import deepAssign from 'assign-deep';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en'
import classNames from 'classnames';
TimeAgo.locale(en)
import createAutoCorrectedDatePipe from 'text-mask-addons/dist/createAutoCorrectedDatePipe';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

import { Colors } from 'consts';
import {
    Row,
    Col,
		Divider,
		Table,
		Panel,
		Button,
		Form,
		Media,
		FormGroup,
		FormControl,
		InputGroup,
		Modal,
		ControlLabel,
		OverlayTrigger,
		Popover,
		Tooltip,
		MaskedTextInput,
		Charts
} from 'components';

import eCommerceData from 'consts/data/e-commerce.json';

import { RoutedComponent, connect } from 'routes/routedComponent';
import renderSection from 'modules/sectionRender';
import treeRandomizer from 'modules/treeRandomizer';
const autoCorrectedDatePipe = createAutoCorrectedDatePipe('mm/dd/yyyy');
const dolarsMaskDecimal = createNumberMask({ prefix: '$', allowDecimal: true });

import {
    CONTENT_VIEW_STATIC,
    CONTENT_VIEW_FLUID,
    CONTENT_VIEW_BOXED,
} from 'layouts/DefaultLayout/modules/layout';
import classes from './Studies.scss';
// ------------------------------------
// Config / Data Generator
// ------------------------------------
const getData = (inputData) => treeRandomizer(inputData);
import tradeData from 'consts/data/exchange-trading.json';
import highStockData from 'consts/data/highStock-USDEUR.json';

import {
  SubscribeTrades,
	selectStudyList
} from './actions'
// ------------------------------------
// Sub Elements
// ------------------------------------

import * as Components from './Components';

const renderSummary = function(trades) {
	console.log(trades)
	var px_max = 0.0
	var px_min = 0.0
	if (trades && trades.length > 0) {
		const px_max_obj = _.maxBy([], function(o){
			// console.log(o)
			return o.Price
		})
		// px_max = px_max_obj.Price
		// // px_min = _.minBy(trades, "Price")
		console.log(px_max_obj)
	}
	return (
	    <div>
	        <Row className={ classes.summary }>
	            <Col md={ 2 } sm={ 4 } xs={ 5 }>
	                <Divider>
	                    Last Price
	                </Divider>
									{trades &&  trades.length > 0?
										<p className={classes.summaryLargeValue}>
		                    {numeral(trades[0].Price).format('0,0.00')}
		                    <small> USD</small>
		                </p>: null}

	            </Col>

	            <Col md={ 3 } sm={ 8 } xs={ 7 }>
	                <Divider>
	                    Daily Change
	                </Divider>
									{/*
										<p className={classes.summaryLargeValue}>
		                    {summaryData.DailyChange.Value}
		                    <small> USD </small>
		                    <small
		                        className={summaryData.DailyChange.Diff < 0
		                            ? classes.summaryValueLess : classes.summaryValueMore }
		                    >
		                        { summaryData.DailyChange.Diff < 0?
		                            <i className="fa fa-caret-down"></i> :
		                            <i className="fa fa-caret-up"></i>}
		                        &nbsp;{summaryData.DailyChange.Diff}%
		                    </small>
		                </p>
										*/}

	            </Col>

	            <Col md={ 3 } sm={ 12 } xs={ 12 }>
	                <Divider>
	                    Daily Range
	                </Divider>
	                <p className={classes.summaryLargeValue}>
	                    {px_min} - {px_max}
	                    <small> USD</small>
	                </p>
	            </Col>
							{/*
								<Col md={ 2 } sm={ 8 } xs={ 7 }>
 									 <Divider>
 											 24h Volume
 									 </Divider>
 									 <p className={classes.summaryLargeValue}>
 											 {summaryData.Volume}
 											 <small> USD</small>
 									 </p>
 							 </Col>
								<Col md={ 2 } sm={ 4 } xs={ 5 }>
									 <Divider>
											 Today's Open
									 </Divider>
									 <p className={classes.summaryLargeValue}>
											 {summaryData.TodayOpen}
											 <small> USD</small>
									 </p>
							 </Col>
							 */}
	        </Row>
	        <Row className={ classes.overall }>
	            <Col md={ 5 } sm={ 6 } xs={ 12 } className='text-center'>
	                <span className={classes.overallEntry}>
	                    <strong>Market Cap</strong>
											{/*<span className={classes.overallValue}>{numeral(summaryData.MarketCap).format('0,0')} USD</span>*/}

	                </span>
	            </Col>
	            <Col md={ 3 } sm={ 6 } xs={ 12 } className={ `text-center` }>
	                <span className={classes.overallEntry}>
	                    <strong>Total Crude Oil Volume (CRD)</strong>
											{/*
												<span className={classes.overallValue}>{numeral(summaryData.Total).format('0,0')} BTC</span>
												*/}

	                </span>
	            </Col>
	        </Row>
	    </div>
	)
};

const getChartData = (inputData) => {
    const data = inputData;

    let startDate = new Date(data[data.length - 1][0]),
        minRate = 1,
        maxRate = 0,
        startPeriod,
        date,
        rate,
        index;

        startDate.setMonth(startDate.getMonth() - 3); // a quarter of a year before last data point
        startPeriod = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());

        for (index = data.length - 1; index >= 0; index = index - 1) {
            date = data[index][0]; // data[i][0] is date
            rate = data[index][1]; // data[i][1] is exchange rate
            if (date < startPeriod) {
                break; // stop measuring highs and lows
            }
            if (rate > maxRate) {
                maxRate = rate;
            }
            if (rate < minRate) {
                minRate = rate;
            }
        }

    return {
        minRate,
        maxRate,
        data: data
    }
};

const generateOrdersData = (count) => {
    const output = [];
    const randomBetweenFloat = (min, max, fixedLength = 2) =>
        (min + Math.random() * (max - min)).toFixed(fixedLength);
    const randomBetween = (min, max) =>
        Math.ceil(parseFloat(randomBetweenFloat(min, max))).toString();

    for(let i = 0; i < count; i++) {
        const newOrder = {
            Price: randomBetweenFloat(50, 1000),
            Btc: randomBetweenFloat(100, 100000, 5),
            Usd: randomBetweenFloat(1000, 10000000),
            Time: leftPad(randomBetween(1, 24), 2, 0) + ':' + leftPad(randomBetween(1, 60), 2, 0),
            Increase: Math.random() > 0.5
        }
        output.push(newOrder);
    }
    return output;
}

const renderExchangePanel = () => (
    <Panel className={ classes.exchangePanel }>
			<Row>
				<Col lg={ 3 }>
	        <Form inline>
	            <FormGroup>
	                <span className={`${classes.exchangePanelTitle} visible-lg-inline`}>
	                    Buy or Sell
	                </span>

	                <InputGroup className={ classes.exchangeInput }>
	                    <InputGroup.Addon>
	                        <i className="fa fa-fw fa-bitcoin"></i>
	                    </InputGroup.Addon>
	                    <FormControl type="number" placeholder="0.00"/>
	                    <InputGroup.Addon>
	                        Amount
	                    </InputGroup.Addon>
	                </InputGroup>

	                <InputGroup className={ classes.exchangeInput }>
	                    <InputGroup.Addon>
	                        <i className="fa fa-fw fa-dollar"></i>
	                    </InputGroup.Addon>
	                    <FormControl type="number" placeholder="0.00"/>
	                    <InputGroup.Addon>
	                        Price USD
	                    </InputGroup.Addon>
	                </InputGroup>
	            </FormGroup>
	        </Form>
				</Col>
				<Col lg={ 3 }>
					<div className={ classes.exchangeActions }>
							<Button
									bsStyle='primary'
									className={ classes.exchangeAction }
							>
									<i className='fa fa-fw fa-download'></i>Buy CRD
							</Button>
							<Button
									bsStyle='danger'
									className={ classes.exchangeAction }
							>
									<i className='fa fa-fw fa-upload'></i>Sell CRD
							</Button>
					</div>
				</Col>
			</Row>
    </Panel>
);

const getChartConfig = (state) => ({
    rangeSelector: {
            selected: 1
        },

        title: {
            text: ''
        },

        yAxis: {
            title: {
                text: ''
            },
            plotLines: [{
                value: state.chartData.minRate,
                color: Colors.brandPrimary,
                dashStyle: 'shortdash',
                width: 1,
                label: {
                    text: '',
                }
            }, {
                value: state.chartData.maxRate,
                color: Colors.brandDanger,
                dashStyle: 'shortdash',
                width: 1,
                label: {
                    text: ''
                }
            }]
        },

        credits: {
        enabled: false
    },
    exporting: {
        enabled: false
    },

    series: [{
        name: 'USD to EUR',
        data: state.chartData.data,
        tooltip: {
            valueDecimals: 4
        }
    }]
});

const renderMostViewedItems = (mostViewed) => {
    const getQuantityStatusClass = (quantity) => {
        return classNames('fa', 'fa-circle', classes.mostViewedItemStatus, {
            [`${classes.mostViewedItemStatusSuccess}`]: quantity > 100,
            [`${classes.mostViewedItemStatusWarning}`]: (quantity <= 100 && quantity > 10),
            [`${classes.mostViewedItemStatusDanger}`]: quantity <= 10,
        });
    };

    const renderMostViewedItem = (item) => (
        <tr key={uid.v4()}>
            <td>
                <Media>
                    <Media.Left>
                        <a href='javascript:void(0)'>
                            <span className="fa-stack fa-lg">
                              <i className="fa fa-square fa-stack-2x text-gray-light"></i>
                              <i className="fa fa-shopping-basket fa-stack-1x fa-inverse"></i>
                            </span>
                        </a>
                    </Media.Left>
                    <Media.Body className={ classes.mediaFix }>
                        <Media.Heading componentClass='div'>
                            <span className='text-white'>
                                { item.name }
                            </span>
                            <br />
                            <span>
                                IDR { item.price }
                            </span>
                        </Media.Heading>
                    </Media.Body>
                </Media>
            </td>
            <td>
                <span className='text-white'>
                    { item.viewCount }
                    <br/>
                    Views
                </span>
            </td>
            <td>
                <i className={ getQuantityStatusClass(item.countLeft) }></i>
                <span className='text-white'>{ item.countLeft }</span> Items Left
            </td>
        </tr>
    );

    return (
        <div className={ classes.mostViewedItems }>
            <div className={ classes.boxHeader }>
                <h5 className={ classes.boxHeaderTitle }>
                    Active Markets
                </h5>
            </div>
            <Table className={ classes.mostViewedItemsTable }>
                <thead>
                    <tr>
                        <th>
                            <strong>Name</strong>
                        </th>
                        <th>
                            <strong>Price</strong>
                        </th>
                        <th>
                            <strong>Status</strong>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    { _.map(mostViewed, (item) => renderMostViewedItem(item)) }
                </tbody>
            </Table>
        </div>
    )
}

const renderOrders = (orders) => {
	const timeAgo = new TimeAgo('en-US')
	var d = new Date(0);
    const renderTime = (time, increase) => (
        <td>
            <i className={`fa fa-fw ${ increase ? classes.iconIncrease + ' fa-caret-up' :
                classes.iconDecrease + ' fa-caret-down' }`}></i>
            {time}
        </td>
    );

    const renderOrdersList = (data, time = false) => (
        <Table
            condensed
            hover
            className={ classes.ordersTable }
        >
            <thead>
                <tr>
                    { time ?
                        <th>Time</th> : null
                    }
                    <th>Trade ID</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Usd</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {_.map(data, (order) => (
                    <tr key={uid.v4()}>
											{ true ? renderTime(order.Price, order.Increase) : null }
												<td  className="text-primary">
														{ numeral(order.TradeID).format('00') }
												</td>
                        <td className="text-white">
                            { order.Price }
                        </td>

                        <td>
                            { numeral(order.Quantity).format('0,0.0000') }
                        </td>
                        <td>
                            { timeAgo.format(d.setUTCSeconds(order.Direction)) }
                        </td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );

    return (
        <Row className={ classes.orders }>
            <Col lg={ 4 }>
                <h5>
                    <i className={`fa fa-fw fa-download ${classes.iconBuy}`}></i>
                    { ' Orders to Buy' }
                </h5>
                { renderOrdersList(orders.slice(0, 15)) }
            </Col>
            <Col lg={ 4 }>
                <h5>
                    <i className={`fa fa-fw fa-download ${classes.iconSell}`}></i>
                    { ' Orders to Sell' }
                </h5>
                { renderOrdersList(orders.slice(0, 15)) }
            </Col>
            <Col lg={ 4 }>
                <h5>
                    <i className={`fa fa-fw fa-bars ${classes.iconAll}`}></i>
                    { ' Recent Trades' }
                </h5>
                { renderOrdersList(orders.slice(-15, -1), true) }
            </Col>
        </Row>
    );
}
// ------------------------------------
// Main Container
// ------------------------------------
class StudiesContainer extends RoutedComponent {
    constructor(props, context) {
        super(props, context);
				const temp_state = deepAssign({}, {
	            Report: {
	                selected: 'Revenue'
	            }
	        }, getData(eCommerceData));

				this.state = Object.assign({}, {
            chartData: getChartData(highStockData)
        }, getData(tradeData), {
            Orders: {
                Buy: generateOrdersData(16),
                Sell: generateOrdersData(16),
                All: generateOrdersData(16)
            }
        }, {
					show_modal : false
				}, temp_state
			);

			this.createPrediction = this.createPrediction.bind(this);


    }

		componentWillMount(prevProps) {
      var targetDef = {
				contentView: CONTENT_VIEW_FLUID,
				sidebarEnabled: false,
				footerEnabled: true,
				footerFixed: true,
				navbarFixed: true,
				headerEnabled: false,

			};
      const { dispatch} = this.props;
			dispatch(SubscribeTrades());
    }

		componentDidMount() {
			const { dispatch, params } = this.props;
			dispatch(selectStudyList(params["status"]))
		}

		createPrediction() {
			const url = ""
			fetch(url, {
	      method: 'GET',
	      headers: {
	        'Accept': 'application/json',
	        'Content-Type': 'application/json'
	      }
	    }).then((response) => response.json()).then((res_json) => {
				console.log("createPrediction")
			}).catch(function(error) {
	      console.error(error)
	    })
		}

    render() {
			const { history, location, params, study_lists, trades } = this.props;
			const {MostViewedItems} = this.state;
			const status = [
			    { title: 'Crude Oil (CRLUSD)', label : "all"},
			    { title: 'Crude Oil (CRLBTC)', label : "all"},
			    { title: 'Corn (CRNUSD)', label : "pending-review"},
			    { title: 'Corn (CRNBTC)', label : "pending-review"},
			    { title: 'Grapes (GRPUSD)', label : "reviewed"},
			    { title: 'Grapes (GRPBTC)', label : "reviewed"}
			];

			_.map(status, function(_status, _idx){
				if (study_lists[_status.label]) {
					_status["count"] = study_lists[_status.label].total_count
				}
			})


			const labels = [
			    { title: 'Pneumonia', color: Colors.brandPrimary },
			    { title: 'Pneumothorax', color: Colors.brandInfo },
			    { title: 'Fractures', color: Colors.brandSuccess },
			    { title: 'Medical Devices', color: Colors.brandDanger }
			];

      return (
          <div className={ classes.mainWrap }>
              <Row>
								<Col lg={ 2 }>
									<Row>
											<Col lg={ 12 } xs={ 6 }>
													<Divider></Divider>
													<h3>Commodity Pairs</h3>
													<Components.SideNav
															items={ status }
															router={ history }
															params={ params }
															query={ location["query"] }
													/>
											</Col>
											{/*
												<Col lg={ 12 } xs={ 6 }>
														<Divider></Divider>
														<h3>Labels</h3>
														<Components.LabelsList
																items={ labels }
														/>
												</Col>
												*/}

									</Row>
								</Col>
								<Col lg={ 10 } className='p-b-3'>
									<Row>
										{ renderSection(renderSummary, trades) }
									</Row>
									<Row>
										<Charts.HighStock config={getChartConfig(this.state)}/>
									</Row>
									<Row>
										{ renderSection(renderExchangePanel) }
									</Row>
									<Row>
										{ renderSection(renderOrders, trades) }
									</Row>
									<Row>
									<div>
											<Row className={ classes.summary }>
													<Col md={ 4 } sm={ 4 } xs={ 5 }>
															<Divider>
																	Prediction Markets
															</Divider>
															<div className={ classes.exchangeActions }>
																	<Button
																			bsStyle='info'
																			onClick={ () => this.setState({
																					show_modal: true
																			})}
																			className={ classes.exchangeAction }
																	>
																			<i className='fa fa-fw fa-group'></i>Create Bet
																	</Button>
															</div>
													</Col>
											</Row>
											<Modal
													show={this.state.show_modal }
													onHide={ () => this.setState({
															show_modal: false
													})}
											>
													<Modal.Header>
															<Modal.Title>Create Prediction in Market</Modal.Title>
													</Modal.Header>

													<Modal.Body>
															<h4>Contract Expiration Date</h4>
															<FormGroup controlId='maskedInputDateAutoCorrected'>
					                        <ControlLabel>Date (Auto-Corrected)</ControlLabel>
					                        <MaskedTextInput
					                            mask={ [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/] }
					                            keepCharPositions={ true }
					                            pipe={ autoCorrectedDatePipe }
					                            placeholder='Please Enter a Date'
					                        />
					                    </FormGroup>
															<h4>Order or Wager/Bet Amount</h4>
															<FormGroup controlId='maskedInputDate'>
																	<ControlLabel>NAS dollar amount (allows decimal)</ControlLabel>
																	<MaskedTextInput
																			mask={ dolarsMaskDecimal }
																			className='text-right'
																			placeholder='Enter an amount'
																	/>
															</FormGroup>
															<h4>Predicted Price of Commodity</h4>
															<FormGroup controlId='maskedInputDate'>
																	<ControlLabel>US dollar amount (allows decimal)</ControlLabel>
																	<MaskedTextInput
																			mask={ dolarsMaskDecimal }
																			className='text-right'
																			placeholder='Enter an amount'
																	/>
															</FormGroup>
															<h4>Commodity Symbol</h4>
															<FormGroup controlId='maskedInputDate'>
																	<ControlLabel>Alpha Point Commodity Futures Symbol</ControlLabel>
																	<MaskedTextInput
																			mask={ dolarsMaskDecimal }
																			className='text-right'
																			placeholder='Enter an Symbol'
																	/>
															</FormGroup>
													</Modal.Body>

													<Modal.Footer>
															<Button onClick={ () => this.setState({
																	show_modal: false
															})}>Close</Button>
															<Button bsStyle="primary" onClick={this.createPrediction}>Submit</Button>
													</Modal.Footer>
											</Modal>

									</div>
									</Row>
									<Row>
										{ renderSection(renderMostViewedItems, this.state.MostViewedItems) }
									</Row>

								</Col>
              </Row>

          </div>
      );
    }
}

const mapStateToProps = (state) => {
  return state.studies;
}

export default connect(mapStateToProps)(StudiesContainer)
