import React, {PropTypes} from 'react';
import {BootstrapTable, TableHeaderColumn} from 'components/ReactTable';
import moment from 'moment';
const _ = require('lodash');
import { Link } from 'react-router';
import { CircleLoader } from 'react-spinners';
import {
    Row,
    Grid,
    Col,
		Panel,
		Media,
    ButtonGroup,
    ButtonToolbar,
    Button,
    InputGroup,
    FormControl,
    DropdownButton,
    MenuItem,
    Label
} from 'components';
import { RoutedComponent, connect } from 'routes/routedComponent';
import classes from './../ReactTables.scss';


import {
  fetchStudies
} from '../actions'

// ------------------------------------
// Sub Elements
// ------------------------------------

const ExpandedComponent = (props) => {

    return (
        <Grid fluid className={classes.expandedRow}>
        </Grid>
    );
};

class StudyTable extends RoutedComponent {
    static propTypes = {
        name: PropTypes.string,
        page_sizes: PropTypes.array
    }

    static defaultProps = {
        name: '',
        page_sizes: [5, 10, 25, 50, 100]
    }

		constructor(props, context) {
        super(props, context);
        this.state = {
            pageSize: 25,
            page_number: 1
        }
				this.onRowClick = this.onRowClick.bind(this);
				this.onPageChange = this.onPageChange.bind(this);
				this.isExpandableRow = this.isExpandableRow.bind(this);
    }

		componentDidMount() {
	  }

    createCustomToolbar(props) {
        const { name: tableName, page_sizes } = this.props;
        const {
            btnGroup,
            searchField,
            clearBtn
        } = props.components;

        return (
            <div>
                <Col md={6}>
                    {
                        tableName && (<h4 className='m-t-0'>{tableName}</h4>)
                    }
                </Col>
                <Col md={6} className='text-right'>
                    <div className={classes.customToolBar}>

                        <div className={classes.search}>
                            <InputGroup bsSize='sm'>
                                { searchField }
                                <InputGroup.Button>
                                    { clearBtn }
                                </InputGroup.Button>
                            </InputGroup>
                        </div>

                        <div className={classes.page_sizes}>
                            <DropdownButton
                                bsSize='sm'
                                title={this.state.pageSize}
                                id='dropdown-page-size'
                                onSelect={(eKey) => {
                                    this.setState({
                                        pageSize: page_sizes[eKey]
                                    })
                                }}
                            >
                                {
                                    page_sizes.map((pageSize, index) => (
                                        <MenuItem key={index} eventKey={index}>{pageSize}</MenuItem>
                                    ))
                                }
                            </DropdownButton>
                        </div>

                        <div className={classes.actions}>
                            { btnGroup }
                        </div>
                    </div>
                </Col>
            </div>
        );
    }

    createCustomButtonGroup(props) {
      return (
        <ButtonGroup bsSize='sm'>
          { props.exportCSVBtn }
          { props.deleteBtn }
          { props.insertBtn }
        </ButtonGroup>
      )
    }

    createPaginationPanel(props) {
        const {
            totalText,
            pageList
        } = props.components;

        return (
          <div>
            <Col md={3}>
                { totalText }
            </Col>
            <Col md={9}>
              {
                React.cloneElement(pageList, {
                    className: `${pageList.props.className} m-y-0 pagination-sm pull-right`
                })
              }
            </Col>
          </div>
        )
    }

		onRowClick(row) {
			var study_id = row.uuid;
			const {selected_study_list, router} = this.props
			router.push('/viewer/study-details/' + selected_study_list + "/" + study_id)
		}
		isExpandableRow(row) {
			return false
		}

		onPageChange(page, sizePerPage) {
			const {study_lists, selected_study_list, dispatch} = this.props;
			const current_study_list = study_lists[selected_study_list];
			const {pageSize} = this.state;
			dispatch(fetchStudies(
				{
					page_size : pageSize,
					page_offset : page - 1,
					status : selected_study_list
				}
			));
			this.setState({page_number : page})
		}

    render() {
			const {study_lists, study_list_loading, selected_study_list} = this.props;
			var {pageSize, page_number} = this.state;
			const current_slice = study_lists[selected_study_list]
			var current_study_list = []
			var current_study_list_count = pageSize
			if (current_slice) {
				current_study_list = current_slice.list;
				current_study_list_count = current_slice.total_count;
				page_number = current_slice.page_offset + 1;
			}


      const options = {
        toolBar: this.createCustomToolbar.bind(this),
        btnGroup: this.createCustomButtonGroup,
        sortOrder: 'desc',
        paginationPanel: this.createPaginationPanel,
        insertBtn: (onClick) => (
          <Button onClick={() => {onClick()}}>
            Add <i className='fa fa-fw fa-plus text-success'></i>
          </Button>
        ),
        deleteBtn: (onClick) => (
          <Button onClick={() => {onClick()}}>
            Delete
          </Button>
        ),
				noDataText: <CircleLoader
						color={'#1ABA9A'}
						loading={true}
					/>,
				onRowClick: this.onRowClick,
        exportCSVBtn: (onClick) => (
          <Button onClick={() => {onClick()}}>
              Export
          </Button>
        ),
        clearSearch: true,
        clearSearchBtn: (onClick) => (
          <Button onClick={() => {onClick()}}>
              <i className='fa fa-search fa-fw'></i>
          </Button>
        ),
        sizePerPage: pageSize,
				onPageChange : this.onPageChange,
				page : page_number,
				prePage: 'Prev', // Previous page button text
				nextPage: 'Next', // Next page button text
				firstPage: 'First', // First page button text
				lastPage: 'Last', // Last page button text

        paginationShowsTotal: false,
        expandParentClass: 'tr-expanded',
				expandBy: 'column',
        expandRowBgColor: '#c1c1c'
      };

      const cellEditProp = {
        mode: 'click'
      };

      const expandOptions = {
        expandColumnVisible: false,
				columnWidth: 70,
        expandColumnComponent: ({isExpandableRow, isExpanded}) =>
          isExpanded ? (
              <div>
								<span><i className='fa fa-eye-slash fa-2x'></i>  <i className='fa fa-angle-down fa-2x'></i></span>
							</div>
          ) : (
						<div>
							<span><i className='fa fa-eye fa-2x'></i>  <i className='fa fa-angle-right fa-2x'></i></span>
						</div>
          )
      };


			var table = <CircleLoader
          color={'#123abc'}
          loading={true}
        />
        return (
					<Row>
						<BootstrapTable
							className={classes.tableMiddle}
							trClassName="text-white"
							data={ current_study_list }
							options={options}
							insertRow
							deleteRow
							exportCSV
							columnFilter
							search
							remote={ true }
							pagination={ true }
							fetchInfo={{ dataTotalSize: current_study_list_count}}
							hover
							striped
							bordered={ true }
							expandableRow= {this.isExpandableRow}
							expandComponent={ (row) => <ExpandedComponent data={row.details} /> }
							expandColumnOptions={ expandOptions }
							cellEdit={ cellEditProp }
							asPanel>
							<TableHeaderColumn
								className="text-primary"
								dataField='id'
								isKey
								hidden>
								Id
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='name'
								className="text-primary"
								width='15%'>
								Patient Name
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='patient_ID'
								className="text-primary"
								width='15%'>
								PatientID
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='patient_birth_date'
								className="text-primary"
								width='15%'>
								Patient Birth Date
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='acquisition_date'
								className="text-primary"
								width='20%'>
								Acquisition Date
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='accession_number'
								className="text-primary"
								width='20%'>
								Accession Number
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='study_description'
								className="text-primary"
								width='10%'>
								Study Description
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='modality'
								className="text-primary"
								width='10%'>
								Modality
							</TableHeaderColumn>
							<TableHeaderColumn
								dataField='original_name'
								className="text-primary"
								width='150px'>
								Original File Name
							</TableHeaderColumn>
						</BootstrapTable>
					</Row>
        )
    }
}

const mapStateToProps = (state) => {
  return state.studies;
}

export default connect(
  mapStateToProps
)(StudyTable)
